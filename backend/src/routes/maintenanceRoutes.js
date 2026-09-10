
import { Router } from "express";
import controller from "../controllers/maintenanceController.js";

const router = Router();

router.get("/dashboard", controller.dashboard.bind(controller));
router.get("/reminders", controller.reminders.bind(controller));
router.get("/service-history", controller.serviceHistory.bind(controller));
router.get("/approvals", controller.approvals.bind(controller));

router.get("/schedules", controller.schedules.bind(controller));
router.get("/schedules/:id", controller.schedule.bind(controller));
router.post("/schedules", controller.createSchedule.bind(controller));
router.put("/schedules/:id", controller.updateSchedule.bind(controller));
router.post("/schedules/:id/approve", controller.approveSchedule.bind(controller));
router.delete("/schedules/:id", controller.deleteSchedule.bind(controller));

router.get("/work-orders", controller.workOrders.bind(controller));
router.get("/work-orders/:id", controller.workOrder.bind(controller));
router.post("/work-orders", controller.createWorkOrder.bind(controller));
router.put("/work-orders/:id", controller.updateWorkOrder.bind(controller));
router.post("/work-orders/:id/approve", controller.approveWorkOrder.bind(controller));
router.post("/work-orders/:id/start", controller.startWorkOrder.bind(controller));
router.post("/work-orders/:id/complete", controller.completeWorkOrder.bind(controller));
router.delete("/work-orders/:id", controller.deleteWorkOrder.bind(controller));
router.post("/incidents/:incidentId/ticket", controller.createIncidentTicket.bind(controller));
router.post("/incidents/:incidentId/resolve", controller.resolveIncident.bind(controller));

router.get("/repairs", controller.repairs.bind(controller));
router.get("/repairs/:id", controller.repair.bind(controller));
router.post("/repairs", controller.createRepair.bind(controller));
router.put("/repairs/:id", controller.updateRepair.bind(controller));
router.delete("/repairs/:id", controller.deleteRepair.bind(controller));

router.get("/compliance", controller.compliance.bind(controller));
router.get("/compliance/:id", controller.complianceItem.bind(controller));
router.post("/compliance", controller.createCompliance.bind(controller));
router.put("/compliance/:id", controller.updateCompliance.bind(controller));
router.delete("/compliance/:id", controller.deleteCompliance.bind(controller));

export default router;
