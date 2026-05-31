import passport from "passport";
import dotenv from "dotenv";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

dotenv.config({ quiet: true });

const jwtSecret =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production" ? undefined : "eventm-development-jwt-secret");

// Local Strategy

const cookieExtractor = (req) => {
  if (req?.cookies?.eventM_token) {
    return req.cookies.eventM_token;
  }

  const cookieHeader = req?.headers?.cookie;
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((cookie) => {
        const [key, ...value] = cookie.trim().split("=");
        return [key, decodeURIComponent(value.join("="))];
      }),
    );

    return cookies.eventM_token || null;
  }

  return null;
};

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },

    async (email, password, done) => {
      try {
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        if (user.authProvider === "google" && !user.password) {
          return done(null, false, {
            message:
              "This account uses Google Sign-In.Please continue with Google.",
          });
        }

        // compare password

        const isMatch = await user.matchPassword(password);
        console.log("Match:", isMatch);

        if (!isMatch) {
          return done(null, false, { message: "Invalid email or password" });
        }

        //remove password before attaching user

        user.password = undefined;

        return done(null, user);
      } catch (error) {
        console.error("Error in LocalStrategy:", error);
        return done(error, false);
      }
    },
  ),
);

// Google Strategy

if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },

      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const googleId = profile.id;
          const displayName = profile.displayName;

          // already linked google account
          let user = await User.findOne({ googleId });

          if (user) {
            return done(null, user);
          }

          //existing local account with same email

          const existingUser = await User.findOne({ email });

          if (existingUser) {
            existingUser.googleId = googleId;

            await existingUser.save();

            return done(null, existingUser);
          }

          // create user
          user = await User.create({
            name: displayName,
            email,
            googleId,
            authProvider: "google",
          });
          return done(null, user);
        } catch (error) {
          console.error("Google Strategy Error:", error);
          return done(error, false);
        }
      },
    ),
  );
} 
// JWT Strategy

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),

      secretOrKey: jwtSecret,
    },
    async (jwtPayload, done) => {
      try {
        const user = await User.findById(jwtPayload.id);

        if (!user) {
          return done(null, false, {
            message: "User no longer exists",
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("JWT Strategy Error:", error);

        return done(error, false);
      }
    },
  ),
);

export default passport;
