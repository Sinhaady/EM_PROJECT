import express from "express";
import {
  createBookingOrder,
  verifyPayment,
  getMyBookings,
  getBookingById, // <-- Add this
  cancelBooking   // <-- Add this
} from "../controllers/booking.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { requireAttendee } from "../middlewares/role.middleware.js";

const router = express.Router();

// Create a new booking order
router.post("/", verifyToken, requireAttendee, createBookingOrder);

// Verify payment
router.post("/verify", verifyToken, requireAttendee, verifyPayment);

// Fetch logged-in user's bookings
router.get("/my-bookings", verifyToken, requireAttendee, getMyBookings);

// Fetch a single booking's details (Must be placed AFTER /my-bookings so Express doesn't confuse "my-bookings" with an ID)
router.get("/:id", verifyToken, requireAttendee, getBookingById);

// Cancel a booking and restore seats
router.put("/:id/cancel", verifyToken, requireAttendee, cancelBooking);

export default router;
