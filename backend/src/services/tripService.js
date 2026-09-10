import prisma from "../config/prisma.js";

const includeRelations = {
  vehicle: true,
  driver: true,
  tripDriver: { include: { driver: true }, orderBy: { startTime: "asc" } },
  tripEvent: { include: { driver: true }, orderBy: { eventTime: "asc" } },
};

function parseDate(value, fieldName) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) throw new Error(`${fieldName} must be a valid date and time.`);
  return date;
}
function parseId(value, fieldName) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error(`${fieldName} must be a valid ID.`);
  return id;
}

const BREAK_AFTER_HOURS = 4;
const MAX_DRIVING_HOURS = 10;
const TRIP_REST_HOURS = 6;
const DRIVING_WINDOW_HOURS = 24;

function overlapMs(start, end, windowStart, now) {
  const from = Math.max(new Date(start).getTime(), windowStart.getTime());
  const to = Math.min(new Date(end || now).getTime(), now.getTime());
  return Math.max(0, to - from);
}

async function driverDrivingSegments(driverId, now = new Date()) {
  const windowStart = new Date(now.getTime() - DRIVING_WINDOW_HOURS * 60 * 60 * 1000);
  return prisma.tripDriver.findMany({
    where: {
      driverId,
      startTime: { lte: now },
      planned: false,
      OR: [{ endTime: null }, { endTime: { gte: windowStart } }],
      trip: { status: { in: ["IN_PROGRESS", "COMPLETED"] } },
    },
    orderBy: { startTime: "asc" },
  });
}

async function getDrivingStatusForDriver(driverId, now = new Date()) {
  const segments = await driverDrivingSegments(driverId, now);
  const drivingMs = segments.reduce((total, segment) => total + overlapMs(segment.startTime, segment.endTime, new Date(now.getTime() - DRIVING_WINDOW_HOURS * 60 * 60 * 1000), now), 0);
  const activeSegment = segments.filter((segment) => !segment.endTime && new Date(segment.startTime) <= now).sort((a, b) => new Date(b.startTime) - new Date(a.startTime))[0] || null;
  const currentDrivingMs = activeSegment ? Math.max(0, now.getTime() - new Date(activeSegment.startTime).getTime()) : 0;
  const lastEnd = await prisma.tripEvent.findFirst({
    where: { driverId, eventType: "END" },
    orderBy: { eventTime: "desc" },
  });
  const cooldownUntil = lastEnd ? new Date(new Date(lastEnd.eventTime).getTime() + TRIP_REST_HOURS * 60 * 60 * 1000) : null;
  const cooldownRemainingMs = cooldownUntil ? Math.max(0, cooldownUntil.getTime() - now.getTime()) : 0;
  return {
    driverId,
    breakAfterHours: BREAK_AFTER_HOURS,
    maxDrivingHours: MAX_DRIVING_HOURS,
    restBetweenTripsHours: TRIP_REST_HOURS,
    drivingWindowHours: DRIVING_WINDOW_HOURS,
    drivingLast24Hours: drivingMs / 3600000,
    currentDrivingHours: currentDrivingMs / 3600000,
    breakDue: currentDrivingMs >= BREAK_AFTER_HOURS * 3600000,
    maxDrivingReached: drivingMs >= MAX_DRIVING_HOURS * 3600000,
    activeSegmentStart: activeSegment?.startTime || null,
    lastTripEnd: lastEnd?.eventTime || null,
    cooldownUntil,
    cooldownRemainingHours: cooldownRemainingMs / 3600000,
  };
}

async function assertVehicleAvailableForTrip(vehicleId, travelDate = null, plannedDistance = null) {
  const date = travelDate ? new Date(travelDate) : new Date();
  const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);

  const [schedule, workOrder, repair, vehicle] = await Promise.all([
    prisma.maintenanceSchedule.findFirst({
      where: {
        vehicleId,
        scheduledDate: { gte: dayStart, lt: dayEnd },
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
      select: { id: true, scheduleNumber: true, serviceType: true, scheduledDate: true },
    }),
    prisma.workOrder.findFirst({
      where: { vehicleId, status: { in: ["APPROVED", "ASSIGNED", "AWAITING_PARTS", "IN_PROGRESS"] } },
      select: { id: true, workOrderNumber: true, maintenanceType: true, status: true },
    }),
    prisma.repair.findFirst({
      where: { vehicleId, repairStatus: { in: ["IN_PROGRESS", "AWAITING_PARTS", "READY_FOR_INSPECTION"] } },
      select: { id: true, repairReference: true, faultReported: true, repairStatus: true },
    }),
    prisma.vehicle.findUnique({ where: { id: vehicleId }, select: { currentMileage: true } }),
  ]);

  if (schedule) {
    const when = new Date(schedule.scheduledDate).toLocaleDateString();
    throw new Error(`Vehicle cannot be scheduled for this trip because it will be under maintenance on ${when} (${schedule.serviceType}).`);
  }
  if (workOrder || repair) {
    const reference = workOrder?.workOrderNumber || repair?.repairReference || `vehicle #${vehicleId}`;
    throw new Error(`This vehicle cannot be allocated for a trip because it has a pending workshop mechanical issue (${reference}). Complete the workshop service before scheduling or starting the trip.`);
  }
  if (plannedDistance != null && vehicle) {
    const remainingToService = await remainingServiceDistance(vehicleId, Number(vehicle.currentMileage || 0), date);
    if (remainingToService != null) {
      const safeTripLimit = Math.max(0, remainingToService - 50);
      if (Number(plannedDistance) > safeTripLimit) {
        throw new Error(`This trip is ${Number(plannedDistance).toFixed(0)} km but the vehicle has only ${remainingToService.toFixed(0)} km remaining before its next service. A 50 km service buffer must be preserved, so the maximum trip distance is ${safeTripLimit.toFixed(0)} km.`);
      }
    }
  }
}

async function remainingServiceDistance(vehicleId, currentMileage, date = new Date()) {
  const next = await prisma.maintenanceSchedule.findFirst({
    where: {
      vehicleId,
      dueMileage: { not: null },
      status: { notIn: ["COMPLETED", "CANCELLED"] },
      scheduledDate: { gte: date },
    },
    orderBy: { dueMileage: "asc" },
    select: { dueMileage: true },
  });
  if (!next || next.dueMileage == null) return null;
  return Math.max(0, Number(next.dueMileage) - Number(currentMileage || 0));
}

async function assertPreTripInspection(driverId, vehicleId, tripCreatedAt, now = new Date()) {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const inspection = await prisma.inspection.findFirst({
    where: {
      driverId,
      vehicleId,
      overallStatus: "PASS",
      inspectionDate: { gte: startOfToday, lte: now },
    },
    orderBy: { inspectionDate: "desc" },
  });
  if (!inspection) {
    throw new Error("You cannot start this trip until you complete a PASS pre-trip vehicle inspection for the assigned vehicle today.");
  }
  return inspection;
}

async function assertDriverStartLimits(driverId, trip, now = new Date()) {
  const activeTrip = await prisma.trip.findFirst({
    where: {
      status: "IN_PROGRESS",
      OR: [{ driverId }, { tripDriver: { some: { driverId, endTime: null, planned: false } } }],
      NOT: { id: trip.id },
    },
    select: { id: true, origin: true, destination: true },
  });
  if (activeTrip) throw new Error(`You already have an ongoing trip (${activeTrip.origin} → ${activeTrip.destination}). End or hand over that trip before starting another one.`);

  const driving = await getDrivingStatusForDriver(driverId, now);
  if (driving.maxDrivingReached) {
    throw new Error("You have reached the 10-hour driving limit within the last 24 hours. You cannot start or continue another trip until the driving window permits it.");
  }
  if (driving.cooldownRemainingHours > 0) {
    throw new Error(`You must have 6 hours of rest between completed trips. You have ${driving.cooldownRemainingHours.toFixed(1)} hours remaining before you can start another trip.`);
  }
  await assertPreTripInspection(driverId, trip.vehicleId, trip.createdAt, now);
  await assertVehicleAvailableForTrip(trip.vehicleId, new Date(), trip.distance);
  return driving;
}

async function enforceDrivingLimitForDriver(driverId, now = new Date()) {
  const status = await getDrivingStatusForDriver(driverId, now);
  if (!status.activeSegmentStart || !status.maxDrivingReached) return status;
  const activeSegment = await prisma.tripDriver.findFirst({
    where: { driverId, endTime: null, planned: false, startTime: { lte: now } },
    orderBy: { startTime: "desc" },
  });
  if (!activeSegment) return status;
  const trip = await prisma.trip.findUnique({ where: { id: activeSegment.tripId }, select: { id: true, status: true } });
  if (!trip || trip.status !== "IN_PROGRESS") return status;
  const existing = await prisma.tripEvent.findFirst({ where: { tripId: trip.id, driverId, eventType: "DRIVING_LIMIT", eventTime: { gte: activeSegment.startTime } } });
  if (!existing) {
    const closed = await prisma.tripDriver.updateMany({
      where: { id: activeSegment.id, endTime: null, planned: false },
      data: { endTime: now, endLocation: "Driving limit reached" },
    });
    if (closed.count === 1) {
      await prisma.tripEvent.create({ data: { tripId: trip.id, driverId, eventType: "DRIVING_LIMIT", eventTime: now, location: "Driving limit reached", notes: "The 10-hour driving limit was reached. Driving segment automatically closed; another driver or trip end is required." } });
    }
  }
  return getDrivingStatusForDriver(driverId, now);
}

async function activeDriverVehicle(driverId) {
  return prisma.assignment.findMany({ where: { driverId, status: "ACTIVE" }, include: { vehicle: true }, orderBy: { assignedAt: "desc" } });
}

async function validateReferences(vehicleId, driverId) {
  const [vehicle, driver] = await Promise.all([
    prisma.vehicle.findUnique({ where: { id: vehicleId } }),
    prisma.driver.findUnique({ where: { id: driverId } }),
  ]);
  if (!vehicle) throw new Error("Selected vehicle was not found.");
  if (!driver) throw new Error("Selected driver was not found.");
  if (vehicle.status !== "ACTIVE") throw new Error("The selected vehicle is not active.");
  if (driver.status !== "ACTIVE") throw new Error("The selected driver is not active.");

  const assignments = await activeDriverVehicle(driverId);
  if (!assignments.some((a) => a.vehicleId === vehicleId)) {
    throw new Error("The selected driver is not currently assigned to the selected vehicle.");
  }
  return { vehicle, driver };
}

async function resolveDriverVehicle(payload, departureTime = new Date()) {
  let vehicleId = payload.vehicleId ? parseId(payload.vehicleId, "Vehicle") : null;
  let driverId = payload.driverId ? parseId(payload.driverId, "Driver") : null;

  if (!driverId && !vehicleId) throw new Error("Select a driver or a vehicle.");

  if (driverId && !vehicleId) {
    const assignments = await activeDriverVehicle(driverId);
    if (!assignments.length) throw new Error("The selected driver has no active vehicle allocation.");
    if (assignments.length > 1) throw new Error("The selected driver has more than one active vehicle allocation. Select the vehicle explicitly.");
    vehicleId = assignments[0].vehicleId;
  }

  if (vehicleId && !driverId) {
    const assignments = await prisma.assignment.findMany({ where: { vehicleId, status: "ACTIVE" }, orderBy: { assignedAt: "desc" } });
    if (!assignments.length) throw new Error("The selected vehicle has no active driver allocation.");
    if (assignments.length > 1) throw new Error("The selected vehicle has two active drivers. Select the primary driver explicitly.");
    driverId = assignments[0].driverId;
  }

  await validateReferences(vehicleId, driverId);
  await assertVehicleAvailableForTrip(vehicleId, departureTime, payload.distance == null || payload.distance === "" ? null : Number(payload.distance));
  return { vehicleId, driverId };
}

async function resolveSecondDriver(vehicleId, primaryDriverId, secondDriverId) {
  if (secondDriverId === undefined || secondDriverId === null || secondDriverId === "") return null;
  const id = parseId(secondDriverId, "Second driver");
  if (id === primaryDriverId) throw new Error("The second driver must be different from the primary driver.");
  const driver = await prisma.driver.findUnique({ where: { id } });
  if (!driver || driver.status !== "ACTIVE") throw new Error("The second driver is not active or was not found.");
  const assignment = await prisma.assignment.findFirst({ where: { driverId: id, vehicleId, status: "ACTIVE" } });
  if (!assignment) throw new Error("The second driver must be actively assigned to the same vehicle as the primary driver.");
  return id;
}

async function ensureNoConflictingTrip({ vehicleId, driverId, additionalDriverIds = [], departureTime, arrivalTime, excludeId }) {
  const start = departureTime;
  const end = arrivalTime || new Date(start.getTime() + 60 * 60 * 1000);
  const driverIds = [driverId, ...additionalDriverIds].filter(Boolean).map(Number);
  const trips = await prisma.trip.findMany({
    where: {
      status: { not: "CANCELLED" },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
      OR: [
        { vehicleId, departureTime: { lt: end }, OR: [{ arrivalTime: null }, { arrivalTime: { gt: start } }] },
        ...driverIds.map(id => ({
          tripDriver: { some: { driverId: id, planned: true } },
          departureTime: { lt: end },
          OR: [{ arrivalTime: null }, { arrivalTime: { gt: start } }],
        })),
        ...driverIds.map(id => ({ driverId: id, departureTime: { lt: end }, OR: [{ arrivalTime: null }, { arrivalTime: { gt: start } }] })),
      ],
    },
    select: { id: true, origin: true, destination: true, vehicleId: true, driverId: true, departureTime: true, arrivalTime: true },
  });
  if (trips.length) {
    const t = trips[0];
    throw new Error(`Scheduling conflict: trip #${t.id} (${t.origin} → ${t.destination}) overlaps the selected vehicle or driver schedule.`);
  }
}

export async function listTrips(params = {}) {
  const { status, driverId, search } = params;
  const where = {};
  if (status && status !== "ALL") where.status = status;
  if (driverId) {
    const id = parseId(driverId, "Driver ID");
    where.OR = [{ driverId: id }, { tripDriver: { some: { driverId: id } } }];
  }
  if (search?.trim()) {
    const q = search.trim();
    where.AND = [{ OR: [{ origin: { contains: q } }, { destination: { contains: q } }, { vehicle: { registration: { contains: q } } }, { driver: { firstName: { contains: q } } }, { driver: { lastName: { contains: q } } }] }];
  }
  return prisma.trip.findMany({ where, include: includeRelations, orderBy: { departureTime: "desc" } });
}

export async function getTrip(id) {
  return prisma.trip.findUnique({ where: { id: parseId(id, "Trip ID") }, include: includeRelations });
}

export async function createTrip(payload) {
  const departureTime = parseDate(payload.departureTime, "Departure time");
  const arrivalTime = payload.arrivalTime ? parseDate(payload.arrivalTime, "Arrival time") : null;
  if (!payload.origin?.trim()) throw new Error("Origin is required.");
  if (!payload.destination?.trim()) throw new Error("Destination is required.");
  const plannedDistance = payload.distance === "" || payload.distance == null ? null : Number(payload.distance);
  if (plannedDistance == null || !Number.isFinite(plannedDistance) || plannedDistance <= 0) {
    throw new Error("Trip distance must be greater than zero.");
  }
  if (arrivalTime && arrivalTime <= departureTime) throw new Error("Arrival time must be later than departure time.");
  const { vehicleId, driverId } = await resolveDriverVehicle(payload, departureTime);
  const secondDriverId = await resolveSecondDriver(vehicleId, driverId, payload.secondDriverId);
  if (plannedDistance > 500 && !secondDriverId) throw new Error("Trips over 500 km require two drivers allocated to the selected vehicle.");
  await ensureNoConflictingTrip({ vehicleId, driverId, additionalDriverIds: secondDriverId ? [secondDriverId] : [], departureTime, arrivalTime });

  const trip = await prisma.trip.create({ data: { origin: payload.origin.trim(), destination: payload.destination.trim(), departureTime, arrivalTime, distance: payload.distance === "" || payload.distance == null ? null : Number(payload.distance), status: "SCHEDULED", vehicleId, driverId }, include: includeRelations });
  await prisma.tripDriver.create({ data: { tripId: trip.id, driverId, startTime: departureTime, planned: false } });
  if (secondDriverId) await prisma.tripDriver.create({ data: { tripId: trip.id, driverId: secondDriverId, startTime: departureTime, planned: true } });
  return getTrip(trip.id);
}

export async function updateTrip(id, payload) {
  const tripId = parseId(id, "Trip ID");
  const existing = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!existing) throw new Error("Trip not found.");
  if (["IN_PROGRESS", "PAUSED", "COMPLETED"].includes(existing.status)) throw new Error("Started or completed trips cannot be rescheduled from this screen.");
  const departureTime = parseDate(payload.departureTime, "Departure time");
  const arrivalTime = payload.arrivalTime ? parseDate(payload.arrivalTime, "Arrival time") : null;
  if (!payload.origin?.trim() || !payload.destination?.trim()) throw new Error("Origin and destination are required.");
  const plannedDistance = payload.distance === "" || payload.distance == null ? null : Number(payload.distance);
  if (plannedDistance == null || !Number.isFinite(plannedDistance) || plannedDistance <= 0) {
    throw new Error("Trip distance must be greater than zero.");
  }
  if (arrivalTime && arrivalTime <= departureTime) throw new Error("Arrival time must be later than departure time.");
  const { vehicleId, driverId } = await resolveDriverVehicle(payload, departureTime);
  const secondDriverId = await resolveSecondDriver(vehicleId, driverId, payload.secondDriverId);
  if (plannedDistance > 500 && !secondDriverId) throw new Error("Trips over 500 km require two drivers allocated to the selected vehicle.");
  await ensureNoConflictingTrip({ vehicleId, driverId, additionalDriverIds: secondDriverId ? [secondDriverId] : [], departureTime, arrivalTime, excludeId: tripId });
  await prisma.trip.update({ where: { id: tripId }, data: { origin: payload.origin.trim(), destination: payload.destination.trim(), departureTime, arrivalTime, distance: payload.distance === "" || payload.distance == null ? null : Number(payload.distance), vehicleId, driverId } });
  await prisma.tripDriver.deleteMany({ where: { tripId: tripId, planned: true } });
  const primary = await prisma.tripDriver.findFirst({ where: { tripId: tripId, planned: false }, orderBy: { startTime: "asc" } });
  if (primary) await prisma.tripDriver.update({ where: { id: primary.id }, data: { driverId, startTime: departureTime } });
  else await prisma.tripDriver.create({ data: { tripId: tripId, driverId, startTime: departureTime, planned: false } });
  if (secondDriverId) await prisma.tripDriver.create({ data: { tripId: tripId, driverId: secondDriverId, startTime: departureTime, planned: true } });
  return getTrip(tripId);
}

export async function deleteTrip(id) {
  return prisma.trip.delete({ where: { id: parseId(id, "Trip ID") } });
}

async function driverIdFromUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { driverId: true, role: true } });
  if (user?.role !== "DRIVER" || !user.driverId) throw new Error("This account is not linked to a driver profile.");
  return user.driverId;
}

async function getTripForDriver(tripId, driverId) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId }, include: includeRelations });
  if (!trip) throw new Error("Trip not found.");
  const allowed = trip.driverId === driverId || trip.tripDriver.some((segment) => segment.driverId === driverId);
  if (!allowed) throw new Error("This trip is not assigned to your driver profile.");
  return trip;
}

export async function driverTrips(userId) {
  const driverId = await driverIdFromUser(userId);
  await enforceDrivingLimitForDriver(driverId);
  const trips = await listTrips({ driverId });
  return trips.map((trip) => ({
    ...trip,
    driverContext: {
      driverId,
      isPrimaryDriver: trip.driverId === driverId,
      isPlannedCoDriver: trip.tripDriver.some((segment) => segment.driverId === driverId && segment.planned),
      isActiveDriver: trip.tripDriver.some((segment) => segment.driverId === driverId && !segment.planned && !segment.endTime),
    },
  }));
}

export async function availableDriversForTrip(userId, tripId) {
  const currentDriverId = await driverIdFromUser(userId);
  const trip = await getTripForDriver(parseId(tripId, "Trip ID"), currentDriverId);
  if (!["IN_PROGRESS", "PAUSED"].includes(trip.status)) throw new Error("Driver changes are only available while a trip is ongoing or paused.");
  const rows = await prisma.assignment.findMany({
    where: { vehicleId: trip.vehicleId, status: "ACTIVE" },
    include: { driver: true },
    orderBy: { driverId: "asc" },
  });
  return rows.map((row) => ({
    driverId: row.driverId,
    vehicleId: row.vehicleId,
    status: row.status,
    driver: row.driver,
    isCurrentDriver: row.driverId === trip.driverId,
    isPlannedCoDriver: trip.tripDriver.some((segment) => segment.driverId === row.driverId && segment.planned),
  }));
}

export async function driverDrivingStatus(userId) {
  const driverId = await driverIdFromUser(userId);
  return enforceDrivingLimitForDriver(driverId);
}

export async function startTrip(userId, tripId, payload = {}) {
  const driverId = await driverIdFromUser(userId);
  const trip = await getTripForDriver(parseId(tripId, "Trip ID"), driverId);
  if (trip.status === "IN_PROGRESS") return trip;
  if (trip.status !== "SCHEDULED") throw new Error("Only scheduled trips can be started.");
  const assignment = await prisma.assignment.findFirst({ where: { driverId, vehicleId: trip.vehicleId, status: "ACTIVE" } });
  if (!assignment) throw new Error("You are not currently assigned to this trip's vehicle.");
  await assertDriverStartLimits(driverId, trip);
  await assertVehicleAvailableForTrip(trip.vehicleId, trip.departureTime, trip.distance);
  const vehicle = await prisma.vehicle.findUnique({ where: { id: trip.vehicleId }, select: { currentMileage: true } });
  const now = new Date();
  const location = payload.location?.trim() || trip.origin;
  const scheduledSegment = trip.tripDriver.find((segment) => segment.driverId === driverId && !segment.endTime && !segment.planned);
  await prisma.$transaction([
    prisma.trip.update({ where: { id: trip.id }, data: { status: "IN_PROGRESS", driverId, startOdometer: vehicle?.currentMileage ?? 0 } }),
    scheduledSegment
      ? prisma.tripDriver.update({ where: { id: scheduledSegment.id }, data: { startTime: now, startLocation: location } })
      : prisma.tripDriver.create({ data: { tripId: trip.id, driverId, startTime: now, startLocation: location } }),
    prisma.tripEvent.create({ data: { tripId: trip.id, driverId, eventType: "START", eventTime: now, location, notes: payload.notes?.trim() || null } }),
  ]);
  return getTrip(trip.id);
}

export async function pauseTrip(userId, tripId, payload = {}) {
  const driverId = await driverIdFromUser(userId);
  const trip = await getTripForDriver(parseId(tripId, "Trip ID"), driverId);
  if (trip.status !== "IN_PROGRESS") throw new Error("Only an ongoing trip can be paused.");
  if (!payload.stopName?.trim() && !payload.location?.trim()) throw new Error("Enter the stop-over name or location.");
  if (trip.driverId !== driverId) throw new Error("Only the driver currently driving this trip can pause it.");

  const now = new Date();
  const openSegment = trip.tripDriver.find((segment) => segment.driverId === driverId && !segment.endTime && !segment.planned);
  const location = payload.location?.trim() || null;

  await prisma.$transaction(async (tx) => {
    if (openSegment) {
      await tx.tripDriver.update({ where: { id: openSegment.id }, data: { endTime: now, endLocation: location } });
    }
    await tx.trip.update({ where: { id: trip.id }, data: { status: "PAUSED" } });
    await tx.tripEvent.create({ data: { tripId: trip.id, driverId, eventType: "PAUSE", eventTime: now, location, stopName: payload.stopName?.trim() || null, notes: payload.notes?.trim() || null } });
  });
  return getTrip(trip.id);
}

export async function resumeTrip(userId, tripId, payload = {}) {
  const driverId = await driverIdFromUser(userId);
  const trip = await getTripForDriver(parseId(tripId, "Trip ID"), driverId);
  if (trip.status !== "PAUSED") throw new Error("Only a paused trip can be resumed.");
  if (trip.driverId !== driverId) throw new Error("Only the driver currently responsible for this trip can resume it.");
  if (trip.tripDriver.some((segment) => segment.driverId === driverId && !segment.endTime && !segment.planned)) {
    throw new Error("Your driving segment is already active.");
  }

  const assignment = await prisma.assignment.findFirst({ where: { driverId, vehicleId: trip.vehicleId, status: "ACTIVE" } });
  if (!assignment) throw new Error("You are no longer actively assigned to this trip's vehicle.");
  const status = await enforceDrivingLimitForDriver(driverId);
  if (status.maxDrivingReached) throw new Error("You have reached the 10-hour driving limit within the last 24 hours. You cannot continue driving this trip.");
  await assertVehicleAvailableForTrip(trip.vehicleId);

  const now = new Date();
  const location = payload.location?.trim() || null;
  await prisma.$transaction(async (tx) => {
    await tx.trip.update({ where: { id: trip.id }, data: { status: "IN_PROGRESS" } });
    await tx.tripDriver.create({ data: { tripId: trip.id, driverId, startTime: now, startLocation: location, planned: false } });
    await tx.tripEvent.create({ data: { tripId: trip.id, driverId, eventType: "RESUME", eventTime: now, location, notes: payload.notes?.trim() || null } });
  });
  return getTrip(trip.id);
}


export async function endTrip(userId, tripId, payload = {}) {
  const driverId = await driverIdFromUser(userId);
  const trip = await getTripForDriver(parseId(tripId, "Trip ID"), driverId);
  if (!["IN_PROGRESS", "PAUSED"].includes(trip.status)) {
    throw new Error("Only an ongoing or paused trip can be ended.");
  }
  if (trip.driverId !== driverId) {
    throw new Error("Only the driver currently responsible for this trip can end it.");
  }
  const rawEnd = payload.endOdometer;
  if (rawEnd === undefined || rawEnd === null || rawEnd === "") {
    throw new Error("Enter the vehicle mileage before ending the trip.");
  }
  const endOdometer = Number(rawEnd);
  if (!Number.isFinite(endOdometer) || endOdometer < 0) {
    throw new Error("Vehicle mileage must be a valid non-negative number.");
  }
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: trip.vehicleId },
    select: { currentMileage: true, registration: true },
  });
  if (!vehicle) throw new Error("The trip vehicle was not found.");
  const startOdometer = Number(trip.startOdometer ?? vehicle.currentMileage ?? 0);
  const currentVehicleMileage = Number(vehicle.currentMileage ?? 0);
  if (endOdometer <= startOdometer) {
    throw new Error(`End mileage must be greater than the trip starting mileage (${startOdometer.toLocaleString()} km). A completed trip cannot have zero or negative distance.`);
  }
  if (endOdometer < currentVehicleMileage) {
    throw new Error(`End mileage cannot be lower than the vehicle's current mileage (${currentVehicleMileage.toLocaleString()} km).`);
  }
  const actualDistance = endOdometer - startOdometer;
  if (actualDistance <= 0) throw new Error("Completed trip distance must be greater than zero.");
  const now = new Date();
  const location = payload.location?.trim() || trip.destination;
  const openSegment = trip.tripDriver.find(
    (segment) => segment.driverId === driverId && !segment.planned && !segment.endTime
  );
  await prisma.$transaction(async (tx) => {
    if (openSegment) {
      await tx.tripDriver.update({
        where: { id: openSegment.id },
        data: { endTime: now, endLocation: location },
      });
    }
    await tx.trip.update({
      where: { id: trip.id },
      data: { status: "COMPLETED", endOdometer, actualDistance, arrivalTime: now },
    });
    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: { currentMileage: endOdometer },
    });
    await tx.tripEvent.create({
      data: {
        tripId: trip.id,
        driverId,
        eventType: "END",
        eventTime: now,
        location,
        notes: `Trip completed. Odometer: ${endOdometer.toLocaleString()} km. Distance travelled: ${actualDistance.toFixed(1)} km.`,
      },
    });
  });
  return getTrip(trip.id);
}

export async function changeDriver(userId, tripId, payload = {}) {
  const currentUserDriverId = await driverIdFromUser(userId);
  const trip = await getTripForDriver(parseId(tripId, "Trip ID"), currentUserDriverId);
  if (!['IN_PROGRESS', 'PAUSED'].includes(trip.status)) throw new Error("Driver handover is only available while a trip is ongoing or paused.");

  const activeCurrent = trip.tripDriver.find((segment) => segment.driverId === trip.driverId && !segment.planned && !segment.endTime);
  const currentIsActive = trip.driverId === currentUserDriverId;
  const currentIsPlanned = trip.tripDriver.some((segment) => segment.driverId === currentUserDriverId && segment.planned);

  // A planned/co-driver invokes the same endpoint with no newDriverId to TAKE OVER.
  if (!payload.newDriverId) {
    if (!currentIsPlanned) throw new Error("You can take over only when you are the planned second driver for this trip.");
    if (trip.driverId === currentUserDriverId) throw new Error("You are already the current driver.");

    const assignment = await prisma.assignment.findFirst({ where: { driverId: currentUserDriverId, vehicleId: trip.vehicleId, status: "ACTIVE" } });
    if (!assignment) throw new Error("You must be actively assigned to the same vehicle to take over this trip.");
    const newDriverStatus = await getDrivingStatusForDriver(currentUserDriverId);
    if (newDriverStatus.maxDrivingReached) throw new Error("You have reached the 10-hour driving limit within the last 24 hours and cannot take over this trip.");

    const now = new Date();
    const location = payload.location?.trim();
    if (!location) throw new Error("Enter the takeover location.");
    const planned = trip.tripDriver.find((segment) => segment.driverId === currentUserDriverId && segment.planned);
    if (!planned) throw new Error("No planned co-driver assignment was found for your driver profile.");

    await prisma.$transaction(async (tx) => {
      if (activeCurrent) await tx.tripDriver.update({ where: { id: activeCurrent.id }, data: { endTime: now, endLocation: location } });
      await tx.tripDriver.update({ where: { id: planned.id }, data: { startTime: now, startLocation: location, planned: false, endTime: null, endLocation: null } });
      await tx.trip.update({ where: { id: trip.id }, data: { driverId: currentUserDriverId, status: "IN_PROGRESS" } });
      await tx.tripEvent.create({ data: { tripId: trip.id, driverId: currentUserDriverId, eventType: "DRIVER_TAKEOVER", eventTime: now, location, notes: `Driver takeover from driver #${trip.driverId}.` } });
    });
    return getTrip(trip.id);
  }

  // The current driver HANDS OVER by creating a pending takeover request.
  if (!currentIsActive) throw new Error("Only the driver currently driving the trip can hand it over.");
  const newDriverId = parseId(payload.newDriverId, "New driver");
  if (newDriverId === trip.driverId) throw new Error("The new driver must be different from the current driver.");
  const newAssignment = await prisma.assignment.findFirst({ where: { driverId: newDriverId, vehicleId: trip.vehicleId, status: "ACTIVE" } });
  if (!newAssignment) throw new Error("The driver taking over must be actively assigned to the same vehicle.");
  const newDriverStatus = await getDrivingStatusForDriver(newDriverId);
  if (newDriverStatus.maxDrivingReached) throw new Error("The driver taking over has reached the 10-hour driving limit within the last 24 hours and cannot take over this trip.");
  const location = payload.location?.trim();
  if (!location) throw new Error("Enter the handover location.");

  // Any other active driver allocated to the same vehicle may receive the handover.
  // This deliberately creates a fresh planned segment so drivers can exchange the
  // driving role repeatedly during the same trip (A -> B -> A -> B ...).
  const existingPending = trip.tripDriver.find(
    (segment) => segment.driverId === newDriverId && segment.planned
  );
  const now = new Date();
  await prisma.$transaction(async (tx) => {
    // Do not create duplicate pending segments if a handover request is repeated.
    if (!existingPending) {
      await tx.tripDriver.create({
        data: {
          tripId: trip.id,
          driverId: newDriverId,
          startTime: now,
          startLocation: location,
          planned: true,
        },
      });
    }
    await tx.tripEvent.create({
      data: {
        tripId: trip.id,
        driverId: currentUserDriverId,
        eventType: "DRIVER_HANDOVER",
        eventTime: now,
        location,
        notes: `Handover requested to driver #${newDriverId}. The receiving driver must use Take Over Trip.`,
      },
    });
  });
  return getTrip(trip.id);
}

export async function tripDashboard() {
  const [scheduled, inProgress, completed, cancelled, upcoming] = await Promise.all([
    prisma.trip.count({ where: { status: "SCHEDULED" } }), prisma.trip.count({ where: { status: "IN_PROGRESS" } }), prisma.trip.count({ where: { status: "COMPLETED" } }), prisma.trip.count({ where: { status: "CANCELLED" } }),
    prisma.trip.findMany({ where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] } }, include: includeRelations, orderBy: { departureTime: "asc" }, take: 10 }),
  ]);
  return { scheduled, inProgress, completed, cancelled, upcoming };
}
