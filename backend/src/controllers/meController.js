import prisma from "../lib/prisma.js";
import incidentService from "../services/incidentService.js";

async function getDriverId(req) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { driverId: true, role: true },
  });
  if (user?.role !== "DRIVER") return null;
  return user?.driverId || null;
}

function isCurrentAssignment(assignment, now = new Date()) {
  const status = String(assignment.status || "").trim().toUpperCase();
  const activeStatus = ["ACTIVE", "ASSIGNED", "IN_PROGRESS"].includes(status);
  if (!activeStatus) return false;
  if (assignment.assignedAt && new Date(assignment.assignedAt) > now) return false;
  if (assignment.unassignedAt && new Date(assignment.unassignedAt) <= now) return false;
  return true;
}

async function getAssignedVehicles(driverId) {
  // Read the driver's allocation records first, then apply one shared definition of
  // "currently assigned". This keeps legacy ASSIGNED records and ACTIVE records working.
  const assignments = await prisma.assignment.findMany({
    where: { driverId },
    include: { vehicle: true },
    orderBy: { assignedAt: "desc" },
  });
  return assignments.filter((assignment) => isCurrentAssignment(assignment));
}

async function findCurrentAssignment(driverId, vehicleId) {
  const assignments = await prisma.assignment.findMany({
    where: { driverId, vehicleId },
    include: { vehicle: true },
    orderBy: { assignedAt: "desc" },
  });
  return assignments.find((assignment) => isCurrentAssignment(assignment)) || null;
}

export async function driverDashboard(req, res) {
  try {
    const driverId = await getDriverId(req);
    if (!driverId) return res.status(404).json({ success: false, message: "This account is not linked to a driver profile." });

    const [driver, assignments, shifts, inspections, incidents, trips, activeShift] = await Promise.all([
      prisma.driver.findUnique({ where: { id: driverId }, include: { assignment: { include: { vehicle: true }, orderBy: { createdAt: "desc" }, take: 10 }, shift: { include: { vehicle: true }, orderBy: { shiftDate: "desc" }, take: 10 } } }),
      prisma.assignment.findMany({ where: { driverId }, include: { vehicle: true }, orderBy: { assignedAt: "desc" }, take: 20 }),
      prisma.shift.findMany({ where: { driverId }, include: { vehicle: true }, orderBy: { shiftDate: "desc" }, take: 20 }),
      prisma.inspection.findMany({ where: { driverId }, include: { vehicle: true }, orderBy: { inspectionDate: "desc" }, take: 20 }),
      prisma.incident.findMany({ where: { driverId }, include: { vehicle: true }, orderBy: { incidentDate: "desc" }, take: 20 }),
      prisma.trip.findMany({ where: { OR: [{ driverId }, { tripDriver: { some: { driverId } } }] }, include: { vehicle: true, driver: true, tripDriver: { include: { driver: true }, orderBy: { startTime: "asc" } }, tripEvent: { include: { driver: true }, orderBy: { eventTime: "asc" } } }, orderBy: { departureTime: "desc" }, take: 20 }),
      prisma.shift.findFirst({ where: { driverId, status: "IN_PROGRESS" }, include: { vehicle: true }, orderBy: { startTime: "desc" } }),
    ]);

    const assignedVehicles = await getAssignedVehicles(driverId);
    res.json({
      success: true,
      data: {
        driver,
        assignments,
        shifts,
        inspections,
        incidents,
        trips,
        activeShift,
        assignedVehicles,
      },
    });
  } catch (error) {
    console.error("driverDashboard", error);
    res.status(500).json({ success: false, message: "Unable to load driver dashboard." });
  }
}

export async function driverResource(req, res) {
  try {
    const driverId = await getDriverId(req);
    if (!driverId) return res.status(404).json({ success: false, message: "This account is not linked to a driver profile." });
    const type = req.params.resource;
    const queries = {
      trips: prisma.trip.findMany({ where: { OR: [{ driverId }, { tripDriver: { some: { driverId } } }] }, include: { vehicle: true, driver: true, tripDriver: { include: { driver: true }, orderBy: { startTime: "asc" } }, tripEvent: { include: { driver: true }, orderBy: { eventTime: "asc" } } }, orderBy: { departureTime: "desc" } }),
      assignments: prisma.assignment.findMany({ where: { driverId }, include: { vehicle: true }, orderBy: { assignedAt: "desc" } }),
      shifts: prisma.shift.findMany({ where: { driverId }, include: { vehicle: true }, orderBy: { shiftDate: "desc" } }),
      inspections: prisma.inspection.findMany({ where: { driverId }, include: { vehicle: true }, orderBy: { inspectionDate: "desc" } }),
      incidents: prisma.incident.findMany({ where: { driverId }, include: { vehicle: true }, orderBy: { incidentDate: "desc" } }),
    };
    if (!queries[type]) return res.status(404).json({ success: false, message: "Unknown driver resource." });
    res.json({ success: true, data: await queries[type] });
  } catch (error) {
    console.error("driverResource", error);
    res.status(500).json({ success: false, message: "Unable to load driver records." });
  }
}

export async function startDriverShift(req, res) {
  try {
    const driverId = await getDriverId(req);
    if (!driverId) return res.status(403).json({ success: false, message: "Only linked driver accounts can start shifts." });

    const existing = await prisma.shift.findFirst({ where: { driverId, status: "IN_PROGRESS" } });
    if (existing) return res.status(409).json({ success: false, message: "You already have an active shift." });

    const vehicleId = Number(req.body.vehicleId);
    if (!Number.isInteger(vehicleId)) return res.status(400).json({ success: false, message: "Please select a vehicle." });

    const assignment = await findCurrentAssignment(driverId, vehicleId);
    if (!assignment) return res.status(400).json({ success: false, message: "The selected vehicle is not currently assigned to you." });

    const startTime = new Date();
    const requestedEnd = req.body.plannedEndTime ? new Date(req.body.plannedEndTime) : new Date(startTime.getTime() + 8 * 60 * 60 * 1000);
    if (Number.isNaN(requestedEnd.getTime()) || requestedEnd <= startTime) return res.status(400).json({ success: false, message: "Planned end time must be after the current time." });

    const shift = await prisma.shift.create({
      data: {
        driverId,
        vehicleId,
        shiftDate: new Date(startTime.toISOString().slice(0, 10)),
        startTime,
        endTime: requestedEnd,
        totalHours: (requestedEnd - startTime) / 3600000,
        status: "IN_PROGRESS",
        notes: req.body.notes ? String(req.body.notes).trim() : null,
      },
      include: { vehicle: true },
    });

    res.status(201).json({ success: true, message: "Shift started successfully.", data: shift });
  } catch (error) {
    console.error("startDriverShift", error);
    res.status(500).json({ success: false, message: "Unable to start shift." });
  }
}

export async function endDriverShift(req, res) {
  try {
    const driverId = await getDriverId(req);
    if (!driverId) return res.status(403).json({ success: false, message: "Only linked driver accounts can end shifts." });

    const shift = await prisma.shift.findFirst({ where: { driverId, status: "IN_PROGRESS" }, orderBy: { startTime: "desc" } });
    if (!shift) return res.status(404).json({ success: false, message: "No active shift was found." });

    const endTime = new Date();
    const updated = await prisma.shift.update({
      where: { id: shift.id },
      data: {
        endTime,
        totalHours: Math.max(0, (endTime - shift.startTime) / 3600000),
        status: "COMPLETED",
      },
      include: { vehicle: true },
    });

    res.json({ success: true, message: "Shift ended successfully.", data: updated });
  } catch (error) {
    console.error("endDriverShift", error);
    res.status(500).json({ success: false, message: "Unable to end shift." });
  }
}

export async function createDriverIncident(req, res) {
  try {
    const driverId = await getDriverId(req);
    if (!driverId) return res.status(403).json({ success: false, message: "Only linked driver accounts can report incidents." });

    const vehicleId = Number(req.body.vehicleId);
    if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
      return res.status(400).json({ success: false, message: "Please select the vehicle involved in the incident." });
    }

    const assignment = await findCurrentAssignment(driverId, vehicleId);
    if (!assignment) {
      return res.status(400).json({ success: false, message: "You can only report incidents for a vehicle currently assigned to you." });
    }

    const incident = await incidentService.createIncident({
      ...req.body,
      vehicleId,
      driverId,
      reportedBy: String(req.user.name || "Driver").trim(),
      status: "OPEN",
    });

    res.status(201).json({ success: true, message: "Incident reported successfully.", data: incident });
  } catch (error) {
    console.error("createDriverIncident", error);
    const message = error?.issues?.[0]?.message || error?.message || "Unable to report incident.";
    res.status(error?.name === "ZodError" ? 400 : 500).json({ success: false, message });
  }
}

export async function createDriverInspection(req, res) {
  try {
    const driverId = await getDriverId(req);
    if (!driverId) return res.status(403).json({ success: false, message: "Only linked driver accounts can submit inspections." });

    const vehicleId = Number(req.body.vehicleId);
    const odometer = Number(req.body.odometer);
    if (!Number.isInteger(vehicleId) || !Number.isFinite(odometer) || odometer < 0) {
      return res.status(400).json({ success: false, message: "Vehicle and a valid odometer reading are required." });
    }

    const assignment = await findCurrentAssignment(driverId, vehicleId);
    if (!assignment) return res.status(400).json({ success: false, message: "You can only inspect a vehicle currently assigned to you." });

    const booleanFields = ["brakes", "tyres", "lights", "engine", "battery", "oilLevel", "coolant", "mirrors", "windshield", "fireExtinguisher", "firstAidKit"];
    const data = {
      vehicleId,
      driverId,
      inspectionDate: req.body.inspectionDate ? new Date(req.body.inspectionDate) : new Date(),
      odometer,
      overallStatus: "PASS",
      inspectorName: String(req.user.name || "Driver").trim(),
      remarks: req.body.remarks ? String(req.body.remarks).trim() : null,
    };
    for (const field of booleanFields) data[field] = req.body[field] !== false;
    data.overallStatus = booleanFields.every((field) => data[field]) ? "PASS" : "FAIL";

    const inspection = await prisma.inspection.create({ data, include: { vehicle: true, driver: true } });
    res.status(201).json({ success: true, message: "Vehicle inspection submitted successfully.", data: inspection });
  } catch (error) {
    console.error("createDriverInspection", error);
    res.status(500).json({ success: false, message: "Unable to submit vehicle inspection." });
  }
}
