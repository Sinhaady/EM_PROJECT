import jwt from "jsonwebtoken";
import passport from "passport";
import dotenv from "dotenv";
import User from "../../models/User.js";
import Session, { hashSessionToken } from "../../models/Session.js";
import { PUBLIC_ASSIGNABLE_ROLES, ROLES, isSuperAdminEmail, toSafeUser } from "../../config/roles.js";

dotenv.config({ quiet: true });

const jwtSecret =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production" ? undefined : "eventm-development-jwt-secret");
const refreshJwtSecret =
  process.env.JWT_REFRESH_SECRET ||
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production" ? undefined : "eventm-development-refresh-secret");
const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL;
const isGoogleOAuthConfigured =
  Boolean(clientUrl) &&
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET) &&
  Boolean(process.env.GOOGLE_CALLBACK_URL);

const accessTokenCookieName = "eventM_token";
const refreshTokenCookieName = "eventM_refreshToken";
const accessTokenMaxAge = 7 * 24 * 60 * 60 * 1000;
const refreshTokenMaxAge = 30 * 24 * 60 * 60 * 1000;

const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge,
});

const getRequestIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
  req.ip ||
  req.socket?.remoteAddress ||
  "";

const signAccessToken = (user, sessionId) => {
  return jwt.sign(
    { id: user._id, name: user.name, sessionVersion: user.sessionVersion ?? 0, sessionId },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

const signRefreshToken = (user, sessionId) => {
  return jwt.sign(
    { id: user._id, sessionVersion: user.sessionVersion ?? 0, sessionId },
    refreshJwtSecret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d" }
  );
};

const readCookie = (req, name) => {
  if (req?.cookies?.[name]) {
    return req.cookies[name];
  }

  const cookieHeader = req?.headers?.cookie;
  if (!cookieHeader) {
    return null;
  }

  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((cookie) => {
      const [key, ...value] = cookie.trim().split("=");
      return [key, decodeURIComponent(value.join("="))];
    }),
  );

  return cookies[name] || null;
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie(accessTokenCookieName, accessToken, getCookieOptions(accessTokenMaxAge));
  res.cookie(refreshTokenCookieName, refreshToken, getCookieOptions(refreshTokenMaxAge));
};

const clearAuthCookies = (res) => {
  const expiredCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
  };

  res.cookie(accessTokenCookieName, "", expiredCookieOptions);
  res.cookie(refreshTokenCookieName, "", expiredCookieOptions);
};

const createAuthSession = async (user, req) => {
  const session = new Session({
    user: user._id,
    sessionVersion: user.sessionVersion ?? 0,
    userAgent: req.get("user-agent") || "Unknown device",
    ipAddress: getRequestIp(req),
    expiresAt: new Date(Date.now() + refreshTokenMaxAge),
  });

  const sessionId = session._id.toString();
  const token = signAccessToken(user, sessionId);
  const refreshToken = signRefreshToken(user, sessionId);

  session.refreshTokenHash = hashSessionToken(refreshToken);
  await session.save();

  return { token, refreshToken };
};

/// ─── Helper: sign JWT and send as httpOnly cookie ─────────────────────────────
export const sendTokenResponse = async (user, statusCode, res, req) => {
  const { token, refreshToken } = await createAuthSession(user, req);

  setAuthCookies(res, token, refreshToken);
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

    await sendTokenResponse(user, 201, res, req);
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

    sendTokenResponse(user, 200, res, req).catch(next);
  })(req, res, next);
};

// ─── @route  POST /api/auth/refresh ──────────────────────────────────────────
// ─── @access Public — uses the httpOnly refresh cookie
export const refreshToken = async (req, res) => {
  try {
    const token = readCookie(req, refreshTokenCookieName);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing. Please log in again.",
      });
    }

    const payload = jwt.verify(token, refreshJwtSecret);
    const [user, session] = await Promise.all([
      User.findById(payload.id),
      payload.sessionId
        ? Session.findOne({
            _id: payload.sessionId,
            user: payload.id,
            isRevoked: false,
          }).select("+refreshTokenHash")
        : null,
    ]);

    if (!user || !session || session.expiresAt <= new Date()) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    if (
      session.refreshTokenHash !== hashSessionToken(token) ||
      (payload.sessionVersion ?? 0) !== (user.sessionVersion ?? 0) ||
      session.sessionVersion !== (user.sessionVersion ?? 0)
    ) {
      session.isRevoked = true;
      session.revokedAt = new Date();
      await session.save();
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "Session has been signed out. Please log in again.",
      });
    }

    const sessionId = session._id.toString();
    const newAccessToken = signAccessToken(user, sessionId);
    const newRefreshToken = signRefreshToken(user, sessionId);

    session.refreshTokenHash = hashSessionToken(newRefreshToken);
    session.lastUsedAt = new Date();
    session.expiresAt = new Date(Date.now() + refreshTokenMaxAge);
    session.userAgent = req.get("user-agent") || session.userAgent;
    session.ipAddress = getRequestIp(req) || session.ipAddress;
    await session.save();

    setAuthCookies(res, newAccessToken, newRefreshToken);

    return res.status(200).json({
      success: true,
      token: newAccessToken,
      user: toSafeUser(user),
    });
  } catch (error) {
    clearAuthCookies(res);

    const message =
      error.name === "TokenExpiredError"
        ? "Refresh token expired. Please log in again."
        : "Invalid refresh token. Please log in again.";

    return res.status(401).json({ success: false, message });
  }
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

  passport.authenticate("google", { session: false }, async (err, user) => {
    if (err || !user) {
      return res.redirect(
        `${clientUrl}/login?error=google_auth_failed`
      );
    }

    const { token, refreshToken } = await createAuthSession(user, req);

    setAuthCookies(res, token, refreshToken);

    const redirectUrl = new URL("/auth/google/callback", clientUrl);
    redirectUrl.searchParams.set("token", token);

    res.redirect(redirectUrl.toString());
  })(req, res, next);
};
// ─── @route  POST /api/auth/logout ───────────────────────────────────────────
// ─── @access Private
export const logout = async (req, res) => {
  try {
    const token = readCookie(req, refreshTokenCookieName) || readCookie(req, accessTokenCookieName);

    if (token) {
      try {
        const payload = jwt.decode(token);

        if (payload?.sessionId) {
          await Session.findOneAndUpdate(
            { _id: payload.sessionId, user: payload.id },
            { isRevoked: true, revokedAt: new Date() },
          );
        }
      } catch {
        // Cookie clearing should still succeed even if token decoding fails.
      }
    }

    clearAuthCookies(res);

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
// ─── @access Private
// @route POST /api/auth/logout-all
// @access Private
export const logoutAllDevices = async (req, res) => {
  try {
    await Promise.all([
      User.findByIdAndUpdate(req.user.id, { $inc: { sessionVersion: 1 } }),
      Session.updateMany(
        { user: req.user.id, isRevoked: false },
        { isRevoked: true, revokedAt: new Date() },
      ),
    ]);
    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    console.error("Logout all devices error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route GET /api/auth/sessions
// @access Private
export const listSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      user: req.user.id,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    })
      .sort({ lastUsedAt: -1 })
      .select("userAgent ipAddress lastUsedAt createdAt expiresAt");

    res.status(200).json({
      success: true,
      sessions: sessions.map((session) => ({
        id: session._id,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
        lastUsedAt: session.lastUsedAt,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        isCurrent: session._id.toString() === req.sessionId,
      })),
    });
  } catch (error) {
    console.error("List sessions error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route DELETE /api/auth/sessions/:sessionId
// @access Private
export const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findOneAndUpdate(
      { _id: sessionId, user: req.user.id, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() },
      { new: true },
    );

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    const revokedCurrentSession = session._id.toString() === req.sessionId;

    if (revokedCurrentSession) {
      clearAuthCookies(res);
    }

    res.status(200).json({
      success: true,
      message: revokedCurrentSession ? "Current session revoked" : "Session revoked",
      revokedCurrentSession,
    });
  } catch (error) {
    console.error("Revoke session error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route GET /api/auth/me
// @access Private
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
