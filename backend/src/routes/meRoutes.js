import { Router } from "express";
import { driverDashboard, driverResource, startDriverShift, endDriverShift, createDriverInspection, createDriverIncident } from "../controllers/meController.js";
import { requireAuth, requireRoles } from "../middleware/authMiddleware.js";

const router = Router();
router.use(requireAuth, requireRoles("DRIVER"));
router.get("/driver-dashboard", driverDashboard);
router.get("/driver/:resource", driverResource);
router.post("/driver/start-shift", startDriverShift);
router.post("/driver/end-shift", endDriverShift);
router.post("/driver/inspections", createDriverInspection);
router.post("/driver/incidents", createDriverIncident);
export default router;
