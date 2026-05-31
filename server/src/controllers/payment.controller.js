import Transaction from "../../models/Transaction.js";
import Event from "../../models/Event.js";

// ─── @route  GET /api/payments/my-transactions ───────────────────────────────
// ─── @access Private (Attendees)
export const getMyTransactions = async (req, res) => {
  try {
    // Fetch all successful transactions for the logged-in user
    const transactions = await Transaction.find({ userId: req.user.id })
      .populate("eventId", "title date")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    console.error("Get My Transactions Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── @route  GET /api/payments/event/:eventId ────────────────────────────────
// ─── @access Private (Organizers & Admins)
export const getEventTransactions = async (req, res) => {
  try {
    const { eventId } = req.params;

    // 1. Verify the event exists and the user owns it
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to view financial data for this event" });
    }

    // 2. Fetch all transactions for this specific event
    const transactions = await Transaction.find({ eventId, status: "SUCCESS" })
      .populate("userId", "name email")
      .populate("bookingId", "tickets status")
      .sort({ createdAt: -1 });

    // 3. Calculate total revenue dynamically
    const totalRevenue = transactions.reduce((sum, current) => sum + current.amount, 0);

    res.status(200).json({ 
      success: true, 
      totalRevenue,
      count: transactions.length, 
      transactions 
    });
  } catch (error) {
    console.error("Get Event Transactions Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
