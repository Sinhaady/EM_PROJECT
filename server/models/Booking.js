import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    tickets: {
      type: Number,
      required: [true, "Number of tickets is required"],
      min: [1, "At least one ticket must be booked"],
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED"],
      default: "PENDING",
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
    reminderSentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

bookingSchema.index({ user: 1, event: 1, status: 1 }, { unique: true });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
