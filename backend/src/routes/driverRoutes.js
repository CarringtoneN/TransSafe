import { Router } from "express";

import {
  getAllDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
} from "../controllers/driverController.js";

const router = Router();

router.get("/", getAllDrivers);

router.get("/:id", getDriver);

router.post("/", createDriver);

router.put("/:id", updateDriver);

router.delete("/:id", deleteDriver);

export default router;