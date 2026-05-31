import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    razorpayOrderId: {
      type: String,
      sparse: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
    },
  },
  // Only track when it was created, no need for an update timer on a ledger
  { timestamps: { createdAt: true, updatedAt: false } },
);

transactionSchema.index({ userId: 1 });
transactionSchema.index({ eventId: 1 });

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
