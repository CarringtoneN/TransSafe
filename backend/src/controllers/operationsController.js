import * as service from "../services/operationsService.js";

function handle(res, error) {
  console.error("[Operations]", error);
  const message = error?.message || "Operation failed.";
  const status =
    /not found/i.test(message) ? 404 :
    /valid|active|already|invalid|must be|required/i.test(message) ? 400 :
    500;
  return res.status(status).json({ success: false, message });
}

export async function allocations(req, res) {
  try { res.json({ success: true, data: await service.listAllocations(req.query) }); }
  catch (e) { handle(res, e); }
}

export async function allocation(req, res) {
  try {
    const data = await service.getAllocation(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Allocation not found." });
    res.json({ success: true, data });
  } catch (e) { handle(res, e); }
}

export async function createAllocation(req, res) {
  try { res.status(201).json({ success: true, data: await service.createAllocation(req.body) }); }
  catch (e) { handle(res, e); }
}

export async function updateAllocation(req, res) {
  try { res.json({ success: true, data: await service.updateAllocation(req.params.id, req.body) }); }
  catch (e) { handle(res, e); }
}

export async function deleteAllocation(req, res) {
  try {
    await service.deleteAllocation(req.params.id);
    res.json({ success: true, message: "Allocation deleted successfully." });
  } catch (e) { handle(res, e); }
}

export async function manifest(req, res) {
  try { res.json({ success: true, data: await service.manifestList(req.query) }); }
  catch (e) { handle(res, e); }
}

export async function manifestDetails(req, res) {
  try { res.json({ success: true, data: await service.manifestByTrip(req.params.tripId) }); }
  catch (e) { handle(res, e); }
}

export async function monitoring(req, res) {
  try { res.json({ success: true, data: await service.monitoring(req.query) }); }
  catch (e) { handle(res, e); }
}

export async function availability(req, res) {
  try { res.json({ success: true, data: await service.availability() }); }
  catch (e) { handle(res, e); }
}
