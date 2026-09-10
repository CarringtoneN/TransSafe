import prisma from "../config/prisma.js";

const toInt = (v) => {
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
};
const toFloat = (v) => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const toDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};
const tripReference = (id) => `TRP-${String(id).padStart(5, "0")}`;

async function assertTrip(id) {
  const tripId = toInt(id);
  if (!tripId) throw Object.assign(new Error("A valid trip is required."), { status: 400 });
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw Object.assign(new Error("Trip not found."), { status: 404 });
  return tripId;
}
async function assertVehicle(id) {
  const vehicleId = toInt(id);
  if (!vehicleId) throw Object.assign(new Error("A valid vehicle is required."), { status: 400 });
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw Object.assign(new Error("Vehicle not found."), { status: 404 });
  return vehicleId;
}
async function assertDriver(id) {
  const driverId = toInt(id);
  if (!driverId) throw Object.assign(new Error("A valid driver is required."), { status: 400 });
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) throw Object.assign(new Error("Driver not found."), { status: 404 });
  return driverId;
}

const tripInclude = { vehicle: true, driver: true };

async function list(req, res, next) {
  try {
    const resource = req.params.resource;
    let data;
    if (resource === "trips") {
      data = await prisma.trip.findMany({ include: tripInclude, orderBy: { departureTime: "desc" } });
      data = data.map((x) => ({ ...x, reference: tripReference(x.id) }));
    } else if (resource === "vehicle-allocations") {
      data = await prisma.vehicleAllocation.findMany({ include: { trip: { include: tripInclude }, vehicle: true }, orderBy: { createdAt: "desc" } });
    } else if (resource === "driver-allocations") {
      data = await prisma.driverAllocation.findMany({ include: { trip: { include: tripInclude }, driver: true }, orderBy: { createdAt: "desc" } });
    } else if (resource === "manifests") {
      data = await prisma.manifest.findMany({ include: { trip: { include: tripInclude } }, orderBy: { createdAt: "desc" } });
    } else if (resource === "monitoring") {
      data = await prisma.monitoringEvent.findMany({ include: { trip: { include: tripInclude } }, orderBy: { eventAt: "desc" } });
    } else {
      return res.status(404).json({ success: false, message: "Unknown operations resource." });
    }
    res.json({ success: true, data });
  } catch (error) { next(error); }
}

async function get(req, res, next) {
  try {
    const id = toInt(req.params.id);
    const resource = req.params.resource;
    if (!id) return res.status(400).json({ success: false, message: "Invalid id." });
    let data;
    if (resource === "trips") data = await prisma.trip.findUnique({ where: { id }, include: tripInclude });
    else if (resource === "vehicle-allocations") data = await prisma.vehicleAllocation.findUnique({ where: { id }, include: { trip: { include: tripInclude }, vehicle: true } });
    else if (resource === "driver-allocations") data = await prisma.driverAllocation.findUnique({ where: { id }, include: { trip: { include: tripInclude }, driver: true } });
    else if (resource === "manifests") data = await prisma.manifest.findUnique({ where: { id }, include: { trip: { include: tripInclude } } });
    else if (resource === "monitoring") data = await prisma.monitoringEvent.findUnique({ where: { id }, include: { trip: { include: tripInclude } } });
    else return res.status(404).json({ success: false, message: "Unknown operations resource." });
    if (!data) return res.status(404).json({ success: false, message: "Record not found." });
    if (resource === "trips") data.reference = tripReference(data.id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
}

async function create(req, res, next) {
  try {
    const resource = req.params.resource;
    const b = req.body || {};
    let data;
    if (resource === "trips") {
      const vehicleId = await assertVehicle(b.vehicleId);
      const driverId = await assertDriver(b.driverId);
      const departureTime = toDate(b.departureTime || b.departureAt);
      if (!b.origin?.trim() || !b.destination?.trim() || !departureTime) return res.status(400).json({ success: false, message: "Origin, destination and a valid departure time are required." });
      const arrivalTime = toDate(b.arrivalTime || b.arrivalAt);
      if (arrivalTime && arrivalTime < departureTime) return res.status(400).json({ success: false, message: "Arrival time cannot be before departure time." });
      data = await prisma.trip.create({ data: { origin: b.origin.trim(), destination: b.destination.trim(), departureTime, arrivalTime, distance: toFloat(b.distance), status: b.status || "SCHEDULED", vehicleId, driverId }, include: tripInclude });
      data.reference = tripReference(data.id);
    } else if (resource === "vehicle-allocations") {
      const tripId = await assertTrip(b.tripId); const vehicleId = await assertVehicle(b.vehicleId);
      data = await prisma.vehicleAllocation.create({ data: { tripId, vehicleId, status: b.status || "ALLOCATED", notes: b.notes || null }, include: { trip: { include: tripInclude }, vehicle: true } });
    } else if (resource === "driver-allocations") {
      const tripId = await assertTrip(b.tripId); const driverId = await assertDriver(b.driverId);
      data = await prisma.driverAllocation.create({ data: { tripId, driverId, status: b.status || "ALLOCATED", notes: b.notes || null }, include: { trip: { include: tripInclude }, driver: true } });
    } else if (resource === "manifests") {
      const tripId = await assertTrip(b.tripId);
      if (!b.reference?.trim() || !b.cargoDescription?.trim()) return res.status(400).json({ success: false, message: "Reference and cargo description are required." });
      data = await prisma.manifest.create({ data: { tripId, reference: b.reference.trim(), cargoDescription: b.cargoDescription.trim(), quantity: Math.max(0, Number(b.quantity) || 0), weightKg: toFloat(b.weightKg), notes: b.notes || null }, include: { trip: { include: tripInclude } } });
    } else if (resource === "monitoring") {
      const tripId = await assertTrip(b.tripId);
      if (!b.eventType?.trim()) return res.status(400).json({ success: false, message: "Event type is required." });
      data = await prisma.monitoringEvent.create({ data: { tripId, eventType: b.eventType.trim(), eventAt: toDate(b.eventAt) || new Date(), latitude: toFloat(b.latitude), longitude: toFloat(b.longitude), speedKph: toFloat(b.speedKph), odometerKm: toFloat(b.odometerKm), notes: b.notes || null }, include: { trip: { include: tripInclude } } });
    } else return res.status(404).json({ success: false, message: "Unknown operations resource." });
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
}

async function update(req, res, next) {
  try {
    const id = toInt(req.params.id); const resource = req.params.resource; const b = req.body || {};
    if (!id) return res.status(400).json({ success: false, message: "Invalid id." });
    let data;
    if (resource === "trips") {
      const current = await prisma.trip.findUnique({ where: { id } }); if (!current) return res.status(404).json({ success: false, message: "Trip not found." });
      const departureTime = toDate(b.departureTime || b.departureAt) || current.departureTime; const arrivalTime = toDate(b.arrivalTime || b.arrivalAt);
      const vehicleId = b.vehicleId == null ? current.vehicleId : await assertVehicle(b.vehicleId); const driverId = b.driverId == null ? current.driverId : await assertDriver(b.driverId);
      if (arrivalTime && arrivalTime < departureTime) return res.status(400).json({ success: false, message: "Arrival time cannot be before departure time." });
      data = await prisma.trip.update({ where: { id }, data: { origin: b.origin?.trim() || current.origin, destination: b.destination?.trim() || current.destination, departureTime, arrivalTime, distance: b.distance === "" ? null : (b.distance == null ? current.distance : toFloat(b.distance)), status: b.status || current.status, vehicleId, driverId }, include: tripInclude });
      data.reference = tripReference(data.id);
    } else if (resource === "vehicle-allocations") {
      const tripId = b.tripId == null ? undefined : await assertTrip(b.tripId); const vehicleId = b.vehicleId == null ? undefined : await assertVehicle(b.vehicleId);
      data = await prisma.vehicleAllocation.update({ where: { id }, data: { ...(tripId ? { tripId } : {}), ...(vehicleId ? { vehicleId } : {}), ...(b.status ? { status: b.status } : {}), notes: b.notes || null }, include: { trip: { include: tripInclude }, vehicle: true } });
    } else if (resource === "driver-allocations") {
      const tripId = b.tripId == null ? undefined : await assertTrip(b.tripId); const driverId = b.driverId == null ? undefined : await assertDriver(b.driverId);
      data = await prisma.driverAllocation.update({ where: { id }, data: { ...(tripId ? { tripId } : {}), ...(driverId ? { driverId } : {}), ...(b.status ? { status: b.status } : {}), notes: b.notes || null }, include: { trip: { include: tripInclude }, driver: true } });
    } else if (resource === "manifests") {
      const tripId = b.tripId == null ? undefined : await assertTrip(b.tripId);
      data = await prisma.manifest.update({ where: { id }, data: { ...(tripId ? { tripId } : {}), reference: b.reference?.trim(), cargoDescription: b.cargoDescription?.trim(), quantity: Math.max(0, Number(b.quantity) || 0), weightKg: toFloat(b.weightKg), notes: b.notes || null }, include: { trip: { include: tripInclude } } });
    } else if (resource === "monitoring") {
      const tripId = b.tripId == null ? undefined : await assertTrip(b.tripId);
      data = await prisma.monitoringEvent.update({ where: { id }, data: { ...(tripId ? { tripId } : {}), eventType: b.eventType?.trim(), eventAt: toDate(b.eventAt) || undefined, latitude: toFloat(b.latitude), longitude: toFloat(b.longitude), speedKph: toFloat(b.speedKph), odometerKm: toFloat(b.odometerKm), notes: b.notes || null }, include: { trip: { include: tripInclude } } });
    } else return res.status(404).json({ success: false, message: "Unknown operations resource." });
    res.json({ success: true, data });
  } catch (error) { next(error); }
}

async function remove(req, res, next) {
  try {
    const id = toInt(req.params.id); const resource = req.params.resource;
    if (!id) return res.status(400).json({ success: false, message: "Invalid id." });
    if (resource === "trips") await prisma.trip.delete({ where: { id } });
    else if (resource === "vehicle-allocations") await prisma.vehicleAllocation.delete({ where: { id } });
    else if (resource === "driver-allocations") await prisma.driverAllocation.delete({ where: { id } });
    else if (resource === "manifests") await prisma.manifest.delete({ where: { id } });
    else if (resource === "monitoring") await prisma.monitoringEvent.delete({ where: { id } });
    else return res.status(404).json({ success: false, message: "Unknown operations resource." });
    res.status(204).end();
  } catch (error) { next(error); }
}

export { list, get, create, update, remove };
