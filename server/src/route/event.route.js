// routes/event.route.js

import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getUniqueCategories,
  getModerationEvents,
  moderateEvent,
} from "../controllers/event.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireOrganizer, requireSuperAdmin } from "../middlewares/role.middleware.js";
import { uploadEventImage } from "../middlewares/upload.middleware.js";

const router = express.Router();

// ─── Public Routes (Browsing Events) ─────────────────────────────────────────

router.get("/", getAllEvents);
router.get("/categories/unique", getUniqueCategories);
router.get("/moderation", verifyToken, requireSuperAdmin, getModerationEvents);
router.get("/:id", getEventById);

// ─── Protected Routes (Managing Events) ──────────────────────────────────────

// Stack middleware: Logged in -> Is Organizer/Admin -> Catch Image Upload -> Run controller
router.post(
  "/", 
  verifyToken, 
  requireOrganizer, 
  uploadEventImage.single("image"), // "image" must match the form-data key from your frontend
  createEvent
);

router.put(
  "/:id", 
  verifyToken, 
  requireOrganizer, 
  updateEvent
);

router.delete(
  "/:id", 
  verifyToken, 
  requireOrganizer, 
  deleteEvent
);

router.patch(
  "/:id/moderation",
  verifyToken,
  requireSuperAdmin,
  moderateEvent
);

export default router;
