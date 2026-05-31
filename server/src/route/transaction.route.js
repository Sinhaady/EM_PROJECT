import express from "express";
import {
  getUserTransactions,
  getTransactionById,
  getEventTransactions,
  getAllTransactions,
} from "../controllers/transaction.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireOrganizer, requireAdmin, requireAttendee } from "../middlewares/role.middleware.js";

const router = express.Router();

// All routes here require authentication
router.use(verifyToken);

// 1. Attendee Endpoint: View own purchases
router.get("/my", requireAttendee, getUserTransactions);

// 2. Organizer Endpoint: View statement for a specific event
router.get("/event/:eventId", requireOrganizer, getEventTransactions);

// 3. Admin Endpoint: Master financial view across the whole platform
router.get("/", requireAdmin, getAllTransactions);

// 4. Detail Endpoint: Get a single receipt (Ownership checked internally inside controller)
router.get("/:id", requireAttendee, getTransactionById);

export default router;
