import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import passport from 'passport';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import './config/passport.js';
import authRoutes from './src/route/auth.route.js';
import userRoutes from './src/route/user.route.js';
import eventRoutes from './src/route/event.route.js';
import bookingRoutes from './src/route/booking.route.js';
import transactionRoutes from './src/route/transaction.route.js';
import paymentRoutes from './src/route/payment.route.js';
import {
  startEventReminderScheduler,
  stopEventReminderScheduler,
} from './src/services/eventReminder.service.js';
import { getAllowedOrigins, validateEnvironment } from './config/env.js';


dotenv.config({ quiet: true });
validateEnvironment();
const app = express();
const allowedOrigins = getAllowedOrigins();

app.set('trust proxy', 1);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      return callback(null, true);
    }

    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "API is running..." });
});

app.get("/api/health", (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;

  res.status(databaseReady ? 200 : 503).json({
    success: databaseReady,
    message: databaseReady
      ? "Ventro API is healthy"
      : "Ventro API is waiting for MongoDB",
    database: databaseReady ? "connected" : "disconnected",
  });
});

app.use("/ok",(req,res)=>{
    res.send("YO EVERYTHING IS FINE");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/payments", paymentRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  const isUploadError =
    err.name === "MulterError" ||
    err.message?.includes("Only JPG, PNG, and WebP") ||
    err.message?.includes("File too large");

  res.status(err.status || (isUploadError ? 400 : 500)).json({
    success: false,
    message:
      isUploadError || process.env.NODE_ENV !== "production"
        ? err.message || "Server error"
        : "Server error",
  });
});

const PORT = Number(process.env.PORT) || 5000;
let server;
let isShuttingDown = false;

const startServer = async () => {
  await connectDB();
  startEventReminderScheduler();
  server = app.listen(PORT,"0.0.0.0",() => {
    console.log(`Server is running on port ${PORT}`);
  });
};

const shutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`${signal} received. Shutting down gracefully.`);
  stopEventReminderScheduler();

  if (!server) {
    mongoose.connection.close(false).finally(() => process.exit(0));
    return;
  }

  server.close(async (error) => {
    if (error) {
      console.error("HTTP server shutdown failed:", error.message);
      process.exit(1);
    }

    try {
      await mongoose.connection.close(false);
      console.log("HTTP server and MongoDB connection closed.");
      process.exit(0);
    } catch (closeError) {
      console.error("MongoDB shutdown failed:", closeError.message);
      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
