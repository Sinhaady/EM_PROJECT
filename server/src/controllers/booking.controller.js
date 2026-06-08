import crypto from "crypto";
import Razorpay from "razorpay";
import Booking from "../../models/Booking.js";
import Event from "../../models/Event.js";
import Transaction from "../../models/Transaction.js";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export const createBookingOrder = async (req, res) => {
  try {
    const { eventId, tickets } = req.body;
    const ticketCount = Number(tickets);
    const userId = req.user.id; 

    if (!eventId || !Number.isInteger(ticketCount) || ticketCount < 1) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid eventId and ticket count",
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.registeredCount + ticketCount > event.capacity) {
      return res.status(400).json({
        success: false,
        message: `Only ${event.capacity - event.registeredCount} tickets remaining.`,
      });
    }

    const totalAmount = event.price * ticketCount;

    if (totalAmount > 0 && !getRazorpay()) {
      return res.status(500).json({
        success: false,
        message: "Razorpay is not configured",
      });
    }

    const booking = await Booking.create({
      user: userId,
      event: eventId,
      tickets: ticketCount,
      status: "PENDING",
    });

    if (totalAmount === 0) {
      booking.status = "CONFIRMED";
      await booking.save();

      event.registeredCount += ticketCount;
      await event.save();

      return res.status(201).json({
        success: true,
        message: "Free booking confirmed",
        booking,
      });
    }

    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_booking_${booking._id}`,
    });

    res.status(200).json({
      success: true,
      bookingId: booking._id,
      order,
    });
  } catch (error) {
    console.error("Create Booking Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You already have a booking for this event.",
      });
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Razorpay is not configured",
      });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await Booking.findByIdAndUpdate(bookingId, { status: "CANCELLED" });
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "CONFIRMED" },
      { new: true },
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    await Event.findByIdAndUpdate(booking.event, {
      $inc: { registeredCount: booking.tickets },
    });

    const event = await Event.findById(booking.event);
    await Transaction.create({
      bookingId: booking._id,
      eventId: booking.event,
      userId: req.user.id,
      amount: event.price * booking.tickets,
      status: "SUCCESS",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    res.status(200).json({
      success: true,
      message: "Payment successful and booking confirmed",
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("event", "title date location image")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("Get My Bookings Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("event", "title date location image")
      .populate("user", "name email");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.user._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking",
      });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error("Get Booking By ID Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({ success: false, message: "Booking is already cancelled" });
    }

    const wasConfirmed = booking.status === "CONFIRMED";
    booking.status = "CANCELLED";
    await booking.save();

    if (wasConfirmed) {
      await Event.findByIdAndUpdate(booking.event, {
        $inc: { registeredCount: -booking.tickets },
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Cancel Booking Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
