import express from "express";
import vehicleController from "../controllers/vehicleController.js";

const router = express.Router();

router.get("/", vehicleController.getAllVehicles);

router.get("/:id/history", vehicleController.getVehicleHistory);

router.get("/:id", vehicleController.getVehicleById);

router.post("/", vehicleController.createVehicle);

router.put("/:id", vehicleController.updateVehicle);

router.delete("/:id", vehicleController.deleteVehicle);

export default router;