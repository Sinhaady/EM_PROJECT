import jwt from "jsonwebtoken";
import passport from "passport";
import dotenv from "dotenv";
import User from "../../models/User.js";
import { PUBLIC_ASSIGNABLE_ROLES, ROLES, isSuperAdminEmail, toSafeUser } from "../../config/roles.js";

dotenv.config({ quiet: true });

const jwtSecret =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production" ? undefined : "eventm-development-jwt-secret");
const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173";
const isGoogleOAuthConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET) &&
  Boolean(process.env.GOOGLE_CALLBACK_URL);

/// ─── Helper: sign JWT and send as httpOnly cookie ─────────────────────────────
export const sendTokenResponse = (user, statusCode, res) => {
  // Using user.name instead of username to match the User schema
  const token = jwt.sign(
    { id: user._id, name: user.name },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie("eventM_token", token, cookieOptions);
  const safeUser = toSafeUser(user);
  
  // ADD THE TOKEN HERE 👇
  res.status(statusCode).json({ success: true, token, user: safeUser }); 
};

// ─── @route  POST /api/auth/register ─────────────────────────────────────────
// ─── @access Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const selectedRole = isSuperAdminEmail(email)
      ? ROLES.SUPER_ADMIN
      : PUBLIC_ASSIGNABLE_ROLES.includes(role)
        ? role
        : ROLES.ATTENDEE;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password",
      });
    }

    // Only checking email uniqueness, as multiple users can have the same display name
    const existingUser = await User.findOne({ 
      $or:[
        {email},
        {name}
      ]
     });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already taken",
      });
    }

    
    const user = await User.create({
      name,
      email,
      password,
      role: selectedRole,
      authProvider: "local",
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── @route  POST /api/auth/login ────────────────────────────────────────────
// ─── @access Public
export const login = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Server error" });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || "Invalid credentials",
      });
    }

    sendTokenResponse(user, 200, res);
  })(req, res, next);
};

// ─── @route  GET /api/auth/google ────────────────────────────────────────────
// ─── @access Public — redirects to Google consent screen
export const googleAuth = (req, res, next) => {
  if (!isGoogleOAuthConfigured) {
    return res.redirect(`${clientUrl}/login?error=google_not_configured`);
  }

  return passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })(req, res, next);
};

// ─── @route  GET /api/auth/google/callback ───────────────────────────────────
// ─── @access Public — Google redirects here after user grants permission
export const googleCallback = (req, res, next) => {
  if (!isGoogleOAuthConfigured) {
    return res.redirect(`${clientUrl}/login?error=google_not_configured`);
  }

  passport.authenticate("google", { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(
        `${clientUrl}/login?error=google_auth_failed`
      );
    }

    const token = jwt.sign(
      { id: user._id, name: user.name },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    res.cookie("eventM_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const redirectUrl = new URL("/auth/google/callback", clientUrl);
    redirectUrl.searchParams.set("token", token);

    res.redirect(redirectUrl.toString());
  })(req, res, next);
};

// ─── @route  POST /api/auth/logout ───────────────────────────────────────────
// ─── @access Private
export const logout = async (req, res) => {
  try {
    res.cookie("eventM_token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
// ─── @access Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user: toSafeUser(user) });
  } catch (error) {
    console.error("GetMe error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
