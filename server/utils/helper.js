import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const jwtSecret =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production" ? undefined : "eventm-development-jwt-secret");

// ─── 1. Token Generation ─────────────────────────────────────────────────────
// Centralizes JWT creation so you can replace the inline jwt.sign() 
// calls inside your auth.controller.js and googleCallback.
export const generateToken = (id, role) => {
  return jwt.sign(
    { id, role }, 
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

// ─── 2. Slugify String ───────────────────────────────────────────────────────
// Perfect for creating SEO-friendly URLs out of Event titles.
// e.g., "Tech Summit 2026! " -> "tech-summit-2026"
export const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")           // Replace spaces with -
    .replace(/[^\w\-]+/g, "")       // Remove all non-word chars (like !, ?, &)
    .replace(/\-\-+/g, "-");        // Replace multiple dashes with a single dash
};

// ─── 3. Format Currency ──────────────────────────────────────────────────────
// Uses the native Intl.NumberFormat API which is the industry standard 
// for localization. Defaults to INR since you are using Razorpay.
export const formatCurrency = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// ─── 4. Calculate Revenue ────────────────────────────────────────────────────
// Safely reduces an array of transaction documents into a single total.
// Includes a guard to ensure it only counts "SUCCESS" transactions if 
// an unfiltered array is accidentally passed in.
export const calculateRevenue = (transactions) => {
  if (!Array.isArray(transactions)) return 0;
  
  return transactions.reduce((sum, transaction) => {
    if (transaction.status && transaction.status !== "SUCCESS") return sum;
    return sum + (transaction.amount || 0);
  }, 0);
};

// ─── 5. Paginate Results ─────────────────────────────────────────────────────
// Converts raw query strings into safe, mathematical skip and limit values.
export const paginateResults = (pageQuery, limitQuery) => {
  const page = Math.max(parseInt(pageQuery, 10) || 1, 1);
  const limit = Math.max(parseInt(limitQuery, 10) || 10, 1);
  const skip = (page - 1) * limit;

  return { skip, limit, page };
};

// ─── 6. Sanitize User ────────────────────────────────────────────────────────
// Safely strips the password out of a user object before sending it to the client.
// Accounts for Mongoose documents by converting them to plain objects first.
export const sanitizeUser = (user) => {
  if (!user) return null;
  
  // If it's a Mongoose document, convert it to a standard JS object
  const cleanUser = typeof user.toObject === "function" ? user.toObject() : { ...user };
  
  delete cleanUser.password;
  return cleanUser;
};
