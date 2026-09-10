import { Router } from "express";
import { summary, data, vehicles } from "../controllers/reportsController.js";

const router = Router();

router.get("/summary", summary);
router.get("/data", data);
router.get("/vehicles", vehicles);

export default router;
