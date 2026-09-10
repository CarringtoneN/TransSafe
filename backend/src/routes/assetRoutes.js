import { Router } from "express";

import {
  getAllAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,
} from "../controllers/assetController.js";

const router = Router();

router.get("/", getAllAssets);

router.get("/:id", getAsset);

router.post("/", createAsset);

router.put("/:id", updateAsset);

router.delete("/:id", deleteAsset);

export default router;