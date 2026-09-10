import prisma from "../config/prisma.js";

const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const money = (value) => Math.round(toNumber(value) * 100) / 100;

const parseDate = (value, fallback) => {
  if (!value) return fallback;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d;
};

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const endOfDay = (d) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

const dateRange = (query) => {
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
  const defaultTo = now;
  return {
    from: startOfDay(parseDate(query.from, defaultFrom)),
    to: endOfDay(parseDate(query.to, defaultTo)),
  };
};

const vehicleWhere = (vehicleId) =>
  vehicleId && Number(vehicleId) > 0 ? { vehicleId: Number(vehicleId) } : {};

const dateFilter = (field, from, to) => ({
  [field]: { gte: from, lte: to },
});

export async function summary(req, res) {
  try {
    const { from, to } = dateRange(req.query);
    const vehicleId = req.query.vehicleId;
    const vf = vehicleWhere(vehicleId);

    const [
      vehicles,
      drivers,
      trips,
      completedTrips,
      fuel,
      incidents,
      maintenance,
      schedules,
      workOrders,
      repairs,
      compliance,
      inspections,
      assignments,
      shifts,
      documents,
    ] = await Promise.all([
      prisma.vehicle.count(),
      prisma.driver.count(),
      prisma.trip.count({ where: { ...vf, ...dateFilter("departureTime", from, to) } }),
      prisma.trip.count({ where: { ...vf, status: "COMPLETED", ...dateFilter("departureTime", from, to) } }),
      prisma.fuelrecord.findMany({
        where: { ...vf, ...dateFilter("fuelDate", from, to) },
        select: { litres: true, cost: true },
      }),
      prisma.incident.findMany({
        where: { ...vf, ...dateFilter("incidentDate", from, to) },
        select: { severity: true, estimatedCost: true, status: true },
      }),
      prisma.maintenance.findMany({
        where: { ...vf, ...dateFilter("serviceDate", from, to) },
        select: { serviceType: true, cost: true },
      }),
      prisma.maintenanceSchedule.count({
        where: { ...vf, ...dateFilter("scheduledDate", from, to) },
      }),
      prisma.workOrder.findMany({
        where: { ...vf, ...dateFilter("dateCreated", from, to) },
        select: { status: true, finalCost: true, estimatedTotalCost: true },
      }),
      prisma.repair.findMany({
        where: { ...vf, ...dateFilter("dateReported", from, to) },
        select: { repairStatus: true, totalRepairCost: true },
      }),
      prisma.compliance.findMany({
        where: {
          ...(vehicleId ? { vehicleId: Number(vehicleId) } : {}),
          OR: [
            { expiryDate: { gte: from, lte: to } },
            { expiryDate: null },
          ],
        },
        select: { status: true },
      }),
      prisma.inspection.count({
        where: { ...vf, ...dateFilter("inspectionDate", from, to) },
      }),
      prisma.assignment.count({
        where: { ...vf, ...dateFilter("assignedAt", from, to) },
      }),
      prisma.shift.findMany({
        where: { ...vf, ...dateFilter("shiftDate", from, to) },
        select: { totalHours: true },
      }),
      prisma.document.findMany({
        where: { ...vf },
        select: { status: true, expiryDate: true },
      }),
    ]);

    const fuelCost = fuel.reduce((s, x) => s + money(x.cost), 0);
    const litres = fuel.reduce((s, x) => s + toNumber(x.litres), 0);
    const incidentCost = incidents.reduce((s, x) => s + money(x.estimatedCost), 0);
    const maintenanceCost = maintenance.reduce((s, x) => s + money(x.cost), 0);
    const workOrderCost = workOrders.reduce(
      (s, x) => s + money(x.finalCost ?? x.estimatedTotalCost),
      0
    );
    const repairCost = repairs.reduce((s, x) => s + money(x.totalRepairCost), 0);
    const totalMaintenanceCost = maintenanceCost + workOrderCost + repairCost;
    const shiftHours = shifts.reduce((s, x) => s + toNumber(x.totalHours), 0);

    const incidentBySeverity = incidents.reduce((acc, x) => {
      const key = x.severity || "UNKNOWN";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const tripByStatus = await prisma.trip.groupBy({
      by: ["status"],
      where: { ...vf, ...dateFilter("departureTime", from, to) },
      _count: { _all: true },
    });

    const workOrderByStatus = workOrders.reduce((acc, x) => {
      acc[x.status] = (acc[x.status] || 0) + 1;
      return acc;
    }, {});

    const repairByStatus = repairs.reduce((acc, x) => {
      acc[x.repairStatus] = (acc[x.repairStatus] || 0) + 1;
      return acc;
    }, {});

    const complianceByStatus = compliance.reduce((acc, x) => {
      acc[x.status] = (acc[x.status] || 0) + 1;
      return acc;
    }, {});

    const expiredDocuments = documents.filter((d) => {
      if (!d.expiryDate) return false;
      return new Date(d.expiryDate) < new Date();
    }).length;

    return res.json({
      success: true,
      data: {
        period: { from, to },
        kpis: {
          vehicles,
          drivers,
          trips,
          completedTrips,
          tripCompletionRate: trips ? Math.round((completedTrips / trips) * 1000) / 10 : 0,
          fuelCost,
          fuelLitres: Math.round(litres * 100) / 100,
          incidentCount: incidents.length,
          incidentCost,
          maintenanceCost: totalMaintenanceCost,
          maintenanceSchedules: schedules,
          workOrders: workOrders.length,
          repairs: repairs.length,
          inspections,
          assignments,
          shiftHours: Math.round(shiftHours * 100) / 100,
          expiredDocuments,
        },
        breakdowns: {
          incidentBySeverity,
          tripByStatus: Object.fromEntries(
            tripByStatus.map((x) => [x.status, x._count._all])
          ),
          workOrderByStatus,
          repairByStatus,
          complianceByStatus,
        },
      },
    });
  } catch (error) {
    console.error("Reports summary error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function data(req, res) {
  try {
    const { from, to } = dateRange(req.query);
    const vehicleId = req.query.vehicleId;
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
    const vf = vehicleWhere(vehicleId);

    const [
      trips,
      fuel,
      incidents,
      maintenance,
      workOrders,
      repairs,
      inspections,
      assignments,
      shifts,
    ] = await Promise.all([
      prisma.trip.findMany({
        where: { ...vf, ...dateFilter("departureTime", from, to) },
        include: { vehicle: true, driver: true },
        orderBy: { departureTime: "desc" },
        take: limit,
      }),
      prisma.fuelrecord.findMany({
        where: { ...vf, ...dateFilter("fuelDate", from, to) },
        include: { vehicle: true },
        orderBy: { fuelDate: "desc" },
        take: limit,
      }),
      prisma.incident.findMany({
        where: { ...vf, ...dateFilter("incidentDate", from, to) },
        include: { vehicle: true, driver: true },
        orderBy: { incidentDate: "desc" },
        take: limit,
      }),
      prisma.maintenance.findMany({
        where: { ...vf, ...dateFilter("serviceDate", from, to) },
        include: { vehicle: true },
        orderBy: { serviceDate: "desc" },
        take: limit,
      }),
      prisma.workOrder.findMany({
        where: { ...vf, ...dateFilter("dateCreated", from, to) },
        include: { vehicle: true },
        orderBy: { dateCreated: "desc" },
        take: limit,
      }),
      prisma.repair.findMany({
        where: { ...vf, ...dateFilter("dateReported", from, to) },
        include: { vehicle: true },
        orderBy: { dateReported: "desc" },
        take: limit,
      }),
      prisma.inspection.findMany({
        where: { ...vf, ...dateFilter("inspectionDate", from, to) },
        include: { vehicle: true, driver: true },
        orderBy: { inspectionDate: "desc" },
        take: limit,
      }),
      prisma.assignment.findMany({
        where: { ...vf, ...dateFilter("assignedAt", from, to) },
        include: { vehicle: true, driver: true },
        orderBy: { assignedAt: "desc" },
        take: limit,
      }),
      prisma.shift.findMany({
        where: { ...vf, ...dateFilter("shiftDate", from, to) },
        include: { vehicle: true, driver: true },
        orderBy: { shiftDate: "desc" },
        take: limit,
      }),
    ]);

    res.json({
      success: true,
      data: {
        period: { from, to },
        trips,
        fuel,
        incidents,
        maintenance,
        workOrders,
        repairs,
        inspections,
        assignments,
        shifts,
      },
    });
  } catch (error) {
    console.error("Reports data error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function vehicles(req, res) {
  try {
    const rows = await prisma.vehicle.findMany({
      select: { id: true, registration: true, make: true, model: true, status: true },
      orderBy: { registration: "asc" },
    });
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
