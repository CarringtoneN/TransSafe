import { Router } from "express";
import * as controller from "../controllers/tripController.js";
import { requireAuth, requireRoles } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/my", requireAuth, requireRoles("DRIVER"), controller.myTrips);
router.get("/my/driving-status", requireAuth, requireRoles("DRIVER"), controller.myDrivingStatus);
router.get("/:id/available-drivers", requireAuth, requireRoles("DRIVER"), controller.availableDriversForTrip);
router.post("/:id/start", requireAuth, requireRoles("DRIVER"), controller.startDriverTrip);
router.post("/:id/pause", requireAuth, requireRoles("DRIVER"), controller.pauseDriverTrip);
router.post("/:id/resume", requireAuth, requireRoles("DRIVER"), controller.resumeDriverTrip);
router.post("/:id/end", requireAuth, requireRoles("DRIVER"), controller.endDriverTrip);
router.post("/:id/change-driver", requireAuth, requireRoles("DRIVER"), controller.changeDriverOnTrip);

router.get("/", controller.list);
router.get("/dashboard", controller.dashboard);
router.get("/:id", controller.get);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
