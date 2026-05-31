import express from "express";
import {
  getMyProfile,
  updateMyProfile,
  changePassword,
  deleteMyAccount,
  getOrganizerStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser
} from "../controllers/user.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireOrganizer, requireAdmin } from "../middlewares/role.middleware.js";

const router = express.Router();

// ─── Every route in this file requires authentication ────────────────────────
router.use(verifyToken);

// ─── Personal Profile Routes (Any logged-in user) ────────────────────────────
router.get("/profile", getMyProfile);
router.put("/profile", updateMyProfile);
router.put("/change-password", changePassword);
router.delete("/profile", deleteMyAccount);

// ─── Organizer Routes ────────────────────────────────────────────────────────
router.get("/organizer-stats", requireOrganizer, getOrganizerStats);

// ─── Admin Routes ────────────────────────────────────────────────────────────
router.get("/", requireAdmin, getAllUsers);
router.get("/:id", requireAdmin, getUserById);
router.put("/:id/role", requireAdmin, updateUserRole);
router.delete("/:id", requireAdmin, deleteUser);

export default router;
