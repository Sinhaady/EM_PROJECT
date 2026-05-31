import passport from "passport";

export const verifyToken = (req, res, next) => {
  passport.authenticate(
    "jwt",
    { session: false }, 
    (err, user, info) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Server error" });
      }

      if (!user) {
        const message =
          info?.name === "TokenExpiredError"
            ? "Token has expired — please log in again"
            : info?.message || "Not authorised — please log in";

        return res.status(401).json({ success: false, message });
      }

      // attach clean user object to request
      req.user = {
        id: user._id.toString(),
        name: user.name,          // Fixed from username
        email: user.email,
        role: user.role,          // Crucial for your upcoming role.middleware.js
        authProvider: user.authProvider,
      };

      next();
    }
  )(req, res, next);
};