import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Ticket price is required (enter 0 for free)"],
      min: [0, "Price cannot be negative"],
    },
    capacity: {
      type: Number,
      required: [true, "Maximum capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },
     registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    image: {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["PUBLISHED", "CANCELLED", "COMPLETED"],
      default: "PUBLISHED",
    },
    category: {
    type: String,
    required: [true, "Event category is required"],
    trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent an organiser from creating two events with the exact same name
eventSchema.index({ createdBy: 1, title: 1 }, { unique: true });
eventSchema.index({ date: 1 });

const Event = mongoose.model("Event", eventSchema);
export default Event;