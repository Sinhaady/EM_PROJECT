// middleware/role.middleware.js

/**
 * Higher-order function to generate role-checking middleware.
 * @param  {...string} roles - The allowed roles for the route.
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    // 1. Defensive check: Ensure verifyToken ran first and attached the user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    // 2. Authorization check: See if the user's role is in the allowed list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }

    // 3. User is authorized, proceed to the controller
    next();
  };
};

// ─── Pre-configured Role Guards ───────────────────────────────────────────────

// Only the fixed super admin can access platform administration.
export const requireAdmin = requireRole("super_admin");
export const requireSuperAdmin = requireAdmin;

// Organizers and the fixed super admin can access organizer-level tools.
export const requireOrganizer = requireRole("organizer", "super_admin");

// Anyone who is logged in can access (e.g., booking a ticket)
export const requireAttendee = requireRole("attendee", "organizer", "admin", "super_admin");

export default requireRole;
