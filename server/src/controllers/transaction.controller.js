import Transaction from "../../models/Transaction.js";
import Event from "../../models/Event.js";

// ─── @route  GET /api/transactions/my ────────────────────────────────────────
// ─── @access Private (Attendees, Organizers, Admins)
export const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .populate("eventId", "title date location price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Get User Transactions Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── @route  GET /api/transactions/:id ───────────────────────────────────────
// ─── @access Private (Transaction Owner & Admins)
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("eventId", "title date location")
      .populate("userId", "name email");

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction record not found" });
    }

    // Security Guard: Only the buyer or an admin can view this specific receipt
    if (transaction.userId._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to view this receipt" });
    }

    res.status(200).json({ success: true, transaction });
  } catch (error) {
    console.error("Get Transaction By ID Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── @route  GET /api/transactions/event/:eventId ────────────────────────────
// ─── @access Private (Event Owner & Admins)
export const getEventTransactions = async (req, res) => {
  try {
    const { eventId } = req.params;

    // 1. Verify the event exists and check ownership
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. You can only view statements for your own events." 
      });
    }

    // 2. Aggregate successful payments for this event
    const transactions = await Transaction.find({ eventId, status: "SUCCESS" })
      .populate("userId", "name email")
      .populate("bookingId", "tickets status")
      .sort({ createdAt: -1 });

    // 3. Compute live running total revenue for the organizer dashboard
    const totalRevenue = transactions.reduce((sum, item) => sum + item.amount, 0);

    res.status(200).json({
      success: true,
      totalRevenue,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Get Event Transactions Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── @route  GET /api/transactions ───────────────────────────────────────────
// ─── @access Private (Admin Only)
export const getAllTransactions = async (req, res) => {
  try {
    // Admins can see every transaction across the entire system
    const transactions = await Transaction.find()
      .populate("userId", "name email")
      .populate("eventId", "title price")
      .sort({ createdAt: -1 });

    // Platform-wide gross revenue aggregation
    const platformGrossRevenue = transactions
      .filter(t => t.status === "SUCCESS")
      .reduce((sum, item) => sum + item.amount, 0);

    res.status(200).json({
      success: true,
      platformGrossRevenue,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Get All Transactions Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
