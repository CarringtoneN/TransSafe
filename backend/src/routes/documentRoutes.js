import { Router } from "express";

import {
  getAllDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../controllers/documentController.js";

const router = Router();

router.get("/", getAllDocuments);

router.get("/:id", getDocument);

router.post("/", createDocument);

router.put("/:id", updateDocument);

router.delete("/:id", deleteDocument);

export default router;