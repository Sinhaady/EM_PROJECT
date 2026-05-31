import User from "../../models/User.js";
import Event from "../../models/Event.js";
import Booking from "../../models/Booking.js";
import Transaction from "../../models/Transaction.js";

// ─── Attendee & General User Routes ──────────────────────────────────────────

// @route  GET /api/users/profile
export const getMyProfile = async (req, res) => {
  try {
    // Fetch fresh data from DB to get fields like 'bio' that aren't in the token
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route  PUT /api/users/profile
export const updateMyProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    
    // We use findByIdAndUpdate to avoid triggering the password pre-save hook
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, avatar },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route  PUT /api/users/change-password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 1. Block Google users from trying to change a password they don't have
    if (req.user.authProvider === "google") {
      return res.status(400).json({ success: false, message: "Google users cannot change passwords here." });
    }

    // 2. Find user and explicitly select the password field (since select: false in schema)
    const user = await User.findById(req.user.id).select("+password");

    // 3. Verify old password using the method we built in User.js
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect old password" });
    }

    // 4. Set new password and save. 
    // The UserSchema.pre('save') hook will automatically bcrypt.hash this for us!
    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route  DELETE /api/users/profile
export const deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Cascade Deletion: Remove their bookings
    await Booking.deleteMany({ user: userId });

    // If they were an organizer, delete their events 
    // (and optionally, the bookings tied to those events)
    const userEvents = await Event.find({ createdBy: userId });
    const eventIds = userEvents.map(e => e._id);
    
    await Booking.deleteMany({ event: { $in: eventIds } });
    await Event.deleteMany({ createdBy: userId });

    // Finally, delete the user
    await User.findByIdAndDelete(userId);

    // Clear the JWT cookie
    res.cookie("eventM_token", "", { httpOnly: true, expires: new Date(0) });
    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ─── Organizer Routes ────────────────────────────────────────────────────────

// @route  GET /api/users/organizer-stats
export const getOrganizerStats = async (req, res) => {
  try {
    const organizerId = req.user.id;

    // 1. Get all events created by this organizer
    const events = await Event.find({ createdBy: organizerId }).select("_id");
    const eventIds = events.map(e => e._id);

    const totalEvents = eventIds.length;

    // 2. Count all CONFIRMED bookings on these events
    const totalBookings = await Booking.countDocuments({ 
      event: { $in: eventIds },
      status: "CONFIRMED"
    });

    // 3. Sum up the revenue from Transactions for these events using MongoDB Aggregation
    const revenueAgg = await Transaction.aggregate([
      { $match: { eventId: { $in: eventIds }, status: "SUCCESS" } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
    ]);

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      stats: { totalEvents, totalBookings, totalRevenue }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ─── Admin Only Routes ───────────────────────────────────────────────────────

// @route  GET /api/users
export const getAllUsers = async (req, res) => {
  try {
    // Basic pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find().skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await User.countDocuments();

    res.status(200).json({ success: true, count: users.length, total, page, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route  GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route  PUT /api/users/:id/role
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["attendee", "organizer", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.status(200).json({ success: true, message: "Role updated", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route  DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Cascade deletion
    await Booking.deleteMany({ user: userId });
    const userEvents = await Event.find({ createdBy: userId });
    const eventIds = userEvents.map(e => e._id);
    
    await Booking.deleteMany({ event: { $in: eventIds } });
    await Event.deleteMany({ createdBy: userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({ success: true, message: "User completely removed from system" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
