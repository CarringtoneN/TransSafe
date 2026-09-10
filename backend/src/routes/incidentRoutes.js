import { Router } from "express";
import incidentController from "../controllers/incidentController.js";

const router = Router();

router.get("/", incidentController.getAllIncidents.bind(incidentController));
router.get("/:id", incidentController.getIncidentById.bind(incidentController));
router.post("/", incidentController.createIncident.bind(incidentController));
router.put("/:id", incidentController.updateIncident.bind(incidentController));
router.delete("/:id", incidentController.deleteIncident.bind(incidentController));

export default router;
