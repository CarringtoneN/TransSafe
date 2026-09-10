import { Router } from "express";
import * as controller from "../controllers/operationsController.js";
import * as tripController from "../controllers/tripController.js";

const router = Router();

// Trip compatibility endpoints.
// These are mounted under /api/operations so Trips still works even when
// an existing app.js has not yet registered /api/trips.
router.get("/trips", tripController.list);
router.get("/trips/dashboard", tripController.dashboard);
router.get("/trips/:id", tripController.get);
router.post("/trips", tripController.create);
router.put("/trips/:id", tripController.update);
router.delete("/trips/:id", tripController.remove);

router.get("/availability", controller.availability);

router.get("/allocations", controller.allocations);
router.get("/allocations/:id", controller.allocation);
router.post("/allocations", controller.createAllocation);
router.put("/allocations/:id", controller.updateAllocation);
router.delete("/allocations/:id", controller.deleteAllocation);

router.get("/manifest", controller.manifest);
router.get("/manifest/:tripId", controller.manifestDetails);

router.get("/monitoring", controller.monitoring);

export default router;
