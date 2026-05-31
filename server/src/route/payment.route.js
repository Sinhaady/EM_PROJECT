import express from "express";
import {
  getMyTransactions,
  getEventTransactions
} from "../controllers/payment.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireOrganizer } from "../middlewares/role.middleware.js";

const router = express.Router();

// ─── Attendee Routes (Receipts) ──────────────────────────────────────────────
// Any logged-in user can view their own payment history
router.get("/my-transactions", verifyToken, getMyTransactions);

// ─── Organizer Routes (Revenue & Analytics) ──────────────────────────────────
// Only organizers and admins can view the financial ledger for an event
router.get("/event/:eventId", verifyToken, requireOrganizer, getEventTransactions);

export default router;
