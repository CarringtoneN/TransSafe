import { Router } from "express";
import inspectionController from "../controllers/inspectionController.js";

const router = Router();

/*
    GET    /api/inspections
*/
router.get(
  "/",
  inspectionController.getAllInspections
);

/*
    GET    /api/inspections/:id
*/
router.get(
  "/:id",
  inspectionController.getInspectionById
);

/*
    POST   /api/inspections
*/
router.post(
  "/",
  inspectionController.createInspection
);

/*
    PUT    /api/inspections/:id
*/
router.put(
  "/:id",
  inspectionController.updateInspection
);

/*
    DELETE /api/inspections/:id
*/
router.delete(
  "/:id",
  inspectionController.deleteInspection
);

export default router;