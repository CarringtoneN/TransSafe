import { Router } from "express";

import {
  getAllFuelRecords,
  getFuelRecord,
  createFuelRecord,
  updateFuelRecord,
  deleteFuelRecord,
} from "../controllers/fuelController.js";

const router = Router();

router.get("/", getAllFuelRecords);

router.get("/:id", getFuelRecord);

router.post("/", createFuelRecord);

router.put("/:id", updateFuelRecord);

router.delete("/:id", deleteFuelRecord);

export default router;