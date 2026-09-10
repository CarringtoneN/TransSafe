import prisma from "../config/prisma.js";

const tripInclude = {
  vehicle: true,
  driver: true,
};

const assignmentInclude = {
  vehicle: true,
  driver: true,
};

function id(value, name) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`${name} must be a valid ID.`);
  return n;
}

export async function listAllocations({ search, status = "ALL" } = {}) {
  const where = {};
  if (status !== "ALL") where.status = status;

  if (search?.trim()) {
    const q = search.trim();
    where.OR = [
      { vehicle: { registration: { contains: q } } },
      { driver: { firstName: { contains: q } } },
      { driver: { lastName: { contains: q } } },
    ];
  }

  return prisma.assignment.findMany({
    where,
    include: assignmentInclude,
    orderBy: { assignedAt: "desc" },
  });
}

export async function getAllocation(allocationId) {
  return prisma.assignment.findUnique({
    where: { id: id(allocationId, "Allocation ID") },
    include: assignmentInclude,
  });
}

async function validateDriverVehicle(driverId, vehicleId) {
  const [driver, vehicle] = await Promise.all([
    prisma.driver.findUnique({ where: { id: driverId } }),
    prisma.vehicle.findUnique({ where: { id: vehicleId } }),
  ]);

  if (!driver) throw new Error("Driver not found.");
  if (!vehicle) throw new Error("Vehicle not found.");
  if (driver.status !== "ACTIVE") throw new Error("Driver is not active.");
  if (vehicle.status !== "ACTIVE") throw new Error("Vehicle is not active.");

  return { driver, vehicle };
}

export async function createAllocation(payload) {
  const driverId = id(payload.driverId, "Driver");
  const vehicleId = id(payload.vehicleId, "Vehicle");
  const assignedAt = new Date(payload.assignedAt || Date.now());

  if (Number.isNaN(assignedAt.getTime())) throw new Error("Assigned date is invalid.");

  await validateDriverVehicle(driverId, vehicleId);

  const status = payload.status || "ACTIVE";

  if (status === "ACTIVE") {
    const [driverConflict, vehicleAssignments, duplicate] = await Promise.all([
      prisma.assignment.findFirst({ where: { driverId, status: "ACTIVE" } }),
      prisma.assignment.findMany({ where: { vehicleId, status: "ACTIVE" } }),
      prisma.assignment.findFirst({ where: { driverId, vehicleId, status: "ACTIVE" } }),
    ]);
    if (driverConflict) throw new Error("Driver already has an active allocation. A driver can only have one vehicle at a time.");
    if (duplicate) throw new Error("This driver is already allocated to this vehicle.");
    if (vehicleAssignments.length >= 2) throw new Error("A vehicle can have a maximum of two active drivers at a time.");
  }

  return prisma.assignment.create({
    data: {
      driverId,
      vehicleId,
      status,
      assignedAt,
      unassignedAt: payload.unassignedAt ? new Date(payload.unassignedAt) : null,
      notes: payload.notes?.trim() || null,
    },
    include: assignmentInclude,
  });
}

export async function updateAllocation(allocationId, payload) {
  const allocationIdNumber = id(allocationId, "Allocation ID");
  const driverId = id(payload.driverId, "Driver");
  const vehicleId = id(payload.vehicleId, "Vehicle");

  await validateDriverVehicle(driverId, vehicleId);

  const status = payload.status || "ACTIVE";

  if (status === "ACTIVE") {
    const [driverConflict, vehicleAssignments, duplicate] = await Promise.all([
      prisma.assignment.findFirst({ where: { driverId, status: "ACTIVE", NOT: { id: allocationIdNumber } } }),
      prisma.assignment.findMany({ where: { vehicleId, status: "ACTIVE", NOT: { id: allocationIdNumber } } }),
      prisma.assignment.findFirst({ where: { driverId, vehicleId, status: "ACTIVE", NOT: { id: allocationIdNumber } } }),
    ]);
    if (driverConflict) throw new Error("Driver already has another active vehicle allocation.");
    if (duplicate) throw new Error("This driver is already allocated to this vehicle.");
    if (vehicleAssignments.length >= 2) throw new Error("A vehicle can have a maximum of two active drivers at a time.");
  }

  return prisma.assignment.update({
    where: { id: allocationIdNumber },
    data: {
      driverId,
      vehicleId,
      status,
      assignedAt: new Date(payload.assignedAt || Date.now()),
      unassignedAt: payload.unassignedAt ? new Date(payload.unassignedAt) : null,
      notes: payload.notes?.trim() || null,
    },
    include: assignmentInclude,
  });
}

export async function deleteAllocation(allocationId) {
  return prisma.assignment.delete({ where: { id: id(allocationId, "Allocation ID") } });
}

export async function manifestList({ tripId, status = "ALL", search } = {}) {
  const where = {};

  if (tripId) where.id = id(tripId, "Trip ID");
  if (status !== "ALL") where.status = status;

  if (search?.trim()) {
    const q = search.trim();
    where.OR = [
      { origin: { contains: q } },
      { destination: { contains: q } },
      { vehicle: { registration: { contains: q } } },
      { driver: { firstName: { contains: q } } },
      { driver: { lastName: { contains: q } } },
    ];
  }

  return prisma.trip.findMany({
    where,
    include: tripInclude,
    orderBy: { departureTime: "desc" },
  });
}

export async function manifestByTrip(tripId) {
  const trip = await prisma.trip.findUnique({
    where: { id: id(tripId, "Trip ID") },
    include: tripInclude,
  });

  if (!trip) throw new Error("Trip not found.");

  const allocation = await prisma.assignment.findFirst({
    where: {
      driverId: trip.driverId,
      vehicleId: trip.vehicleId,
      status: "ACTIVE",
    },
    include: assignmentInclude,
    orderBy: { assignedAt: "desc" },
  });

  return {
    trip,
    allocation,
    manifest: {
      reference: `TRIP-${String(trip.id).padStart(6, "0")}`,
      generatedAt: new Date(),
      currency: "KES",
    },
  };
}

export async function monitoring({ status = "ALL", search } = {}) {
  const where = {
    ...(status !== "ALL" ? { status } : { status: { in: ["SCHEDULED", "IN_PROGRESS"] } }),
  };

  if (search?.trim()) {
    const q = search.trim();
    where.OR = [
      { origin: { contains: q } },
      { destination: { contains: q } },
      { vehicle: { registration: { contains: q } } },
      { driver: { firstName: { contains: q } } },
      { driver: { lastName: { contains: q } } },
    ];
  }

  const trips = await prisma.trip.findMany({
    where,
    include: tripInclude,
    orderBy: { departureTime: "asc" },
  });

  const activeAssignments = await prisma.assignment.findMany({
    where: { status: "ACTIVE" },
    include: assignmentInclude,
    orderBy: { assignedAt: "desc" },
  });

  return {
    generatedAt: new Date(),
    trips,
    activeAssignments,
    counts: {
      activeTrips: trips.filter((t) => t.status === "IN_PROGRESS").length,
      scheduledTrips: trips.filter((t) => t.status === "SCHEDULED").length,
      activeAssignments: activeAssignments.length,
    },
  };
}

export async function availability() {
  const [vehicles, drivers, assignments, trips] = await Promise.all([
    prisma.vehicle.findMany({ orderBy: { registration: "asc" } }),
    prisma.driver.findMany({ orderBy: { lastName: "asc" } }),
    prisma.assignment.findMany({
      where: { status: "ACTIVE" },
      select: { vehicleId: true, driverId: true },
    }),
    prisma.trip.findMany({
      where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] } },
      select: { vehicleId: true, driverId: true },
    }),
  ]);

  const vehicleAssignmentCounts = assignments.reduce((m, a) => m.set(a.vehicleId, (m.get(a.vehicleId) || 0) + 1), new Map());
  const assignedDriverIds = new Set(assignments.map((a) => a.driverId));
  const busyVehicleIds = new Set(trips.map((t) => t.vehicleId));
  const busyDriverIds = new Set(trips.map((t) => t.driverId));

  return {
    vehicles: vehicles.map((v) => ({
      ...v,
      available: v.status === "ACTIVE" && (vehicleAssignmentCounts.get(v.id) || 0) < 2 && !busyVehicleIds.has(v.id),
    })),
    drivers: drivers.map((d) => ({
      ...d,
      available: d.status === "ACTIVE" && !assignedDriverIds.has(d.id) && !busyDriverIds.has(d.id),
    })),
  };
}
