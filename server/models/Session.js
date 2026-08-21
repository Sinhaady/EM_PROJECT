import crypto from "crypto";
import mongoose from "mongoose";

export const hashSessionToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      select: false,
    },
    sessionVersion: {
      type: Number,
      required: true,
      default: 0,
    },
    userAgent: {
      type: String,
      default: "Unknown device",
      trim: true,
    },
    ipAddress: {
      type: String,
      default: "",
      trim: true,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

sessionSchema.index({ user: 1, isRevoked: 1, expiresAt: 1 });

const Session = mongoose.model("Session", sessionSchema);

export default Session;
