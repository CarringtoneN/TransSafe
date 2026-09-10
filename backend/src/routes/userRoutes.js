import { Router } from "express";
import { createUser, listUsers, resetPassword, updateUser, updateUserStatus, deleteUser } from "../controllers/userController.js";
import { requireAuth, requireRoles } from "../middleware/authMiddleware.js";

const router = Router();
router.use(requireAuth, requireRoles("ADMIN"));
router.get("/", listUsers);
router.post("/", createUser);
router.patch("/:id", updateUser);
router.patch("/:id/status", updateUserStatus);
router.post("/:id/reset-password", resetPassword);
router.delete("/:id", deleteUser);
export default router;
