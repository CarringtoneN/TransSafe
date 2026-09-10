import { Router } from "express";
import { getOperationalAlerts } from "../controllers/alertsController.js";
import { requireAuth, requireRoles } from "../middleware/authMiddleware.js";

const router = Router();
router.get("/", requireAuth, requireRoles("DRIVER", "OPERATIONS_MANAGER", "MAINTENANCE_COMPLIANCE", "TECHNICIAN_MECHANIC"), getOperationalAlerts);

export default router;
