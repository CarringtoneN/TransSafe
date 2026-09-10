import express from "express";
import assignmentController from "../controllers/assignmentController.js";

const router = express.Router();

router.get("/", assignmentController.getAllAssignments);

router.get("/:id", assignmentController.getAssignment);

router.post("/", assignmentController.createAssignment);

router.put("/:id", assignmentController.updateAssignment);

router.delete("/:id", assignmentController.deleteAssignment);

export default router;