import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  googleAuth,
  googleCallback,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ─── Local auth ───────────────────────────────────────────────────────────────
router.get("/register", (req, res) => {
  res.status(405).json({
    success: false,
    message: "Use POST /api/auth/register with name, email and password", // Updated message
  });
});
router.post("/register", register);

router.get("/login", (req, res) => {
  res.status(405).json({
    success: false,
    message: "Use POST /api/auth/login with email and password",
  });
});
router.post("/login", login);

// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

// ─── Private routes ───────────────────────────────────────────────────────────
router.post("/logout", verifyToken, logout);
router.get("/me", verifyToken, getMe);

export default router;
