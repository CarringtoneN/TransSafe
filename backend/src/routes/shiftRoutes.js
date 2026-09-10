import express from "express";
import shiftController from "../controllers/shiftController.js";

const router = express.Router();

router.get("/", shiftController.getAllShifts);

router.get("/:id", shiftController.getShiftById);

router.post("/", shiftController.createShift);

router.put("/:id", shiftController.updateShift);

router.delete("/:id", shiftController.deleteShift);

export default router;