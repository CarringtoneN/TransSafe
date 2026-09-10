import prisma from "../config/prisma.js";
import { driverDrivingStatus } from "../services/tripService.js";

const SUPPORTED_ROLES = [
  "FLEET_MANAGER",
  "OPERATIONS_MANAGER",
  "MAINTENANCE_COMPLIANCE",
  "TECHNICIAN_MECHANIC",
];

function urgencyFor(date, now) {
  const target = new Date(date);
  if (target < now) return "CRITICAL";
  const days = (target - now) / 86400000;
  if (days <= 7) return "HIGH";
  return "MEDIUM";
}

function sortAlerts(alerts) {
  const rank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  return alerts.sort((a, b) => {
    const severity = (rank[a.severity] ?? 9) - (rank[b.severity] ?? 9);
    if (severity !== 0) return severity;
    return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
  });
}

export async function getOperationalAlerts(req, res) {
  try {
    const role = req.user?.role;
    if (role === "DRIVER") {
      const driving = await driverDrivingStatus(req.user.id);
      const alerts = [];
      if (driving.maxDrivingReached) {
        alerts.push({
          id: "driver-driving-limit",
          type: "DRIVER_SAFETY",
          severity: "CRITICAL",
          title: "10-hour driving limit reached",
          message: "You have reached the maximum 10 hours of driving within the last 24 hours. You cannot start or continue driving until the driving limit permits it.",
          timestamp: new Date(),
          path: "/my-trips",
        });
      } else if (driving.breakDue) {
        alerts.push({
          id: "driver-break-due",
          type: "DRIVER_SAFETY",
          severity: "HIGH",
          title: "4-hour driving break due",
          message: `You have been driving continuously for ${driving.currentDrivingHours.toFixed(1)} hours. Please take a break before continuing.`,
          timestamp: new Date(),
          path: "/my-trips",
        });
      }
      if (driving.cooldownRemainingHours > 0) {
        alerts.push({
          id: "driver-rest-period",
          type: "DRIVER_SAFETY",
          severity: "MEDIUM",
          title: "Rest period in progress",
          message: `${driving.cooldownRemainingHours.toFixed(1)} hours remain before you can start another trip.`,
          timestamp: driving.lastTripEnd || new Date(),
          path: "/my-trips",
        });
      }
      return res.json({ success: true, data: { generatedAt: new Date(), role, alerts, counts: { total: alerts.length, critical: alerts.filter(a => a.severity === "CRITICAL").length, high: alerts.filter(a => a.severity === "HIGH").length } } });
    }
    if (!SUPPORTED_ROLES.includes(role)) {
      return res.status(403).json({ success: false, message: "Operational alerts are not available for this profile." });
    }

    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 86400000);
    const in30Days = new Date(now.getTime() + 30 * 86400000);
    const in24Hours = new Date(now.getTime() + 24 * 3600000);

    const includeMaintenance = role === "TECHNICIAN_MECHANIC" || role === "MAINTENANCE_COMPLIANCE" || role === "OPERATIONS_MANAGER" || role === "FLEET_MANAGER";
    const includeIncidents = true;
    const includeWorkOrders = role === "TECHNICIAN_MECHANIC" || role === "MAINTENANCE_COMPLIANCE" || role === "FLEET_MANAGER";
    const includeCompliance = role === "MAINTENANCE_COMPLIANCE";
    const includeTrips = role === "OPERATIONS_MANAGER";

    const [maintenance, incidents, workOrders, compliance, trips] = await Promise.all([
      includeMaintenance
        ? prisma.maintenanceSchedule.findMany({
            where: {
              status: { in: ["SCHEDULED", "IN_PROGRESS"] },
              scheduledDate: { lte: in30Days },
            },
            include: { vehicle: true, assignedDriver: true },
            orderBy: { scheduledDate: "asc" },
            take: 20,
          })
        : [],
      includeIncidents
        ? prisma.incident.findMany({
            where: { status: { in: ["OPEN", "UNDER_INVESTIGATION"] } },
            include: { vehicle: true, driver: true },
            orderBy: [{ severity: "desc" }, { incidentDate: "desc" }],
            take: 20,
          })
        : [],
      includeWorkOrders
        ? prisma.workOrder.findMany({
            where: { status: { in: ["PENDING_APPROVAL", "APPROVED", "ASSIGNED", "AWAITING_PARTS", "IN_PROGRESS"] } },
            include: { vehicle: true },
            orderBy: { dateCreated: "desc" },
            take: 20,
          })
        : [],
      includeCompliance
        ? prisma.compliance.findMany({
            where: {
              OR: [
                { status: { in: ["EXPIRED", "EXPIRING_SOON", "MISSING"] } },
                { expiryDate: { lte: in30Days } },
              ],
            },
            include: { vehicle: true, driver: true },
            orderBy: { expiryDate: "asc" },
            take: 20,
          })
        : [],
      includeTrips
        ? prisma.trip.findMany({
            where: {
              status: { in: ["SCHEDULED", "IN_PROGRESS"] },
              departureTime: { lte: in24Hours },
            },
            include: { vehicle: true, driver: true },
            orderBy: { departureTime: "asc" },
            take: 20,
          })
        : [],
    ]);

    const alerts = [];

    for (const item of maintenance) {
      const scheduledDate = new Date(item.scheduledDate);
      const severity = urgencyFor(scheduledDate, now);
      alerts.push({
        id: `maintenance-${item.id}`,
        type: "MAINTENANCE",
        severity,
        title: severity === "CRITICAL" ? "Maintenance overdue" : "Upcoming maintenance",
        message: `${item.serviceType} for ${item.vehicle?.registration || `vehicle #${item.vehicleId}`} is scheduled for ${scheduledDate.toLocaleString()}.`,
        timestamp: item.scheduledDate,
        path: "/maintenance-schedule",
        referenceId: item.id,
        vehicle: item.vehicle?.registration || null,
      });
    }

    for (const item of incidents) {
      const severity = ["CRITICAL", "HIGH"].includes(item.severity) ? item.severity : "MEDIUM";
      alerts.push({
        id: `incident-${item.id}`,
        type: "INCIDENT",
        severity,
        title: `${item.severity || "OPEN"} incident requires attention`,
        message: `${item.incidentType} involving ${item.vehicle?.registration || `vehicle #${item.vehicleId}`} at ${item.location || "an unspecified location"}.`,
        timestamp: item.incidentDate,
        path: "/incidents",
        referenceId: item.id,
        vehicle: item.vehicle?.registration || null,
      });
    }

    for (const item of workOrders) {
      const severity = ["CRITICAL", "HIGH"].includes(item.priority) ? item.priority : "MEDIUM";
      alerts.push({
        id: `work-order-${item.id}`,
        type: "WORK_ORDER",
        severity,
        title: "Active work order",
        message: `${item.workOrderNumber}: ${item.workDescription} — ${item.status.replaceAll("_", " ")}.`,
        timestamp: item.estimatedCompletionDate || item.dateCreated,
        path: "/work-orders",
        referenceId: item.id,
        vehicle: item.vehicle?.registration || null,
      });
    }

    for (const item of compliance) {
      const expiry = item.expiryDate ? new Date(item.expiryDate) : null;
      const severity = !expiry || expiry < now ? "CRITICAL" : expiry <= in7Days ? "HIGH" : "MEDIUM";
      alerts.push({
        id: `compliance-${item.id}`,
        type: "COMPLIANCE",
        severity,
        title: expiry && expiry < now ? "Compliance expired" : "Compliance expiring soon",
        message: `${item.itemName} requires attention${expiry ? ` by ${expiry.toLocaleDateString()}` : "."}${item.vehicle?.registration ? ` Vehicle: ${item.vehicle.registration}.` : ""}`,
        timestamp: item.expiryDate || item.updatedAt,
        path: "/compliance",
        referenceId: item.id,
        vehicle: item.vehicle?.registration || null,
      });
    }

    for (const item of trips) {
      const departure = new Date(item.departureTime);
      const severity = departure <= new Date(now.getTime() + 2 * 3600000) ? "HIGH" : "MEDIUM";
      alerts.push({
        id: `trip-${item.id}`,
        type: "TRIP",
        severity,
        title: departure < now ? "Trip requires immediate attention" : "Upcoming trip",
        message: `${item.origin} → ${item.destination} departs ${departure.toLocaleString()} with ${item.vehicle?.registration || "unassigned vehicle"}.`,
        timestamp: item.departureTime,
        path: "/trips",
        referenceId: item.id,
        vehicle: item.vehicle?.registration || null,
      });
    }

    const sorted = sortAlerts(alerts).slice(0, 30);
    const counts = {
      total: sorted.length,
      critical: sorted.filter((a) => a.severity === "CRITICAL").length,
      high: sorted.filter((a) => a.severity === "HIGH").length,
      maintenance: sorted.filter((a) => a.type === "MAINTENANCE").length,
      incidents: sorted.filter((a) => a.type === "INCIDENT").length,
      workOrders: sorted.filter((a) => a.type === "WORK_ORDER").length,
      compliance: sorted.filter((a) => a.type === "COMPLIANCE").length,
      trips: sorted.filter((a) => a.type === "TRIP").length,
    };

    return res.json({
      success: true,
      data: {
        generatedAt: now,
        role,
        alerts: sorted,
        counts,
      },
    });
  } catch (error) {
    console.error("getOperationalAlerts", error);
    return res.status(500).json({ success: false, message: "Unable to load operational alerts." });
  }
}
