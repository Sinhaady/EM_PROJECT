import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import passport from 'passport';
import connectDB from './config/db.js';
import './config/passport.js';
import authRoutes from './src/route/auth.route.js';
import userRoutes from './src/route/user.route.js';
import eventRoutes from './src/route/event.route.js';
import bookingRoutes from './src/route/booking.route.js';
import transactionRoutes from './src/route/transaction.route.js';
import paymentRoutes from './src/route/payment.route.js';


dotenv.config({ quiet: true });
const app = express();
const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL;

app.use(cors({
  origin: clientUrl || true,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

connectDB();

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "API is running..." });
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
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error",
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
