import * as tripService from "../services/tripService.js";

function handleError(res, error) {
  const message = error?.message || "Operation failed.";
  const status =
    /not found/i.test(message) ? 404 :
    /required|valid|must be|already|overlapping|active/i.test(message) ? 400 :
    500;

  console.error("[Trips]", error);
  return res.status(status).json({ success: false, message });
}

export async function list(req, res) {
  try {
    res.json({ success: true, data: await tripService.listTrips(req.query) });
  } catch (error) {
    handleError(res, error);
  }
}

export async function get(req, res) {
  try {
    const data = await tripService.getTrip(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Trip not found." });
    res.json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
}

export async function create(req, res) {
  try {
    res.status(201).json({ success: true, data: await tripService.createTrip(req.body) });
  } catch (error) {
    handleError(res, error);
  }
}

export async function update(req, res) {
  try {
    res.json({ success: true, data: await tripService.updateTrip(req.params.id, req.body) });
  } catch (error) {
    handleError(res, error);
  }
}

export async function remove(req, res) {
  try {
    await tripService.deleteTrip(req.params.id);
    res.json({ success: true, message: "Trip deleted successfully." });
  } catch (error) {
    handleError(res, error);
  }
}

export async function dashboard(req, res) {
  try {
    res.json({ success: true, data: await tripService.tripDashboard() });
  } catch (error) {
    handleError(res, error);
  }
}

export async function myTrips(req, res) {
  try { res.json({ success: true, data: await tripService.driverTrips(req.user.id) }); }
  catch (error) { handleError(res, error); }
}

export async function availableDriversForTrip(req, res) {
  try { res.json({ success: true, data: await tripService.availableDriversForTrip(req.user.id, req.params.id) }); }
  catch (error) { handleError(res, error); }
}

export async function myDrivingStatus(req, res) {
  try { res.json({ success: true, data: await tripService.driverDrivingStatus(req.user.id) }); }
  catch (error) { handleError(res, error); }
}

export async function startDriverTrip(req, res) {
  try { res.json({ success: true, data: await tripService.startTrip(req.user.id, req.params.id, req.body) }); }
  catch (error) { handleError(res, error); }
}

export async function pauseDriverTrip(req, res) {
  try { res.json({ success: true, data: await tripService.pauseTrip(req.user.id, req.params.id, req.body) }); }
  catch (error) { handleError(res, error); }
}

export async function resumeDriverTrip(req, res) {
  try { res.json({ success: true, data: await tripService.resumeTrip(req.user.id, req.params.id, req.body) }); }
  catch (error) { handleError(res, error); }
}

export async function endDriverTrip(req, res) {
  try { res.json({ success: true, data: await tripService.endTrip(req.user.id, req.params.id, req.body) }); }
  catch (error) { handleError(res, error); }
}

export async function changeDriverOnTrip(req, res) {
  try { res.json({ success: true, data: await tripService.changeDriver(req.user.id, req.params.id, req.body) }); }
  catch (error) { handleError(res, error); }
}
