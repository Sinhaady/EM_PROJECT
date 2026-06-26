import User from "../../models/User.js";
import Event from "../../models/Event.js";
import Booking from "../../models/Booking.js";
import Transaction from "../../models/Transaction.js";
import { sendEventCancelledEmail } from "../../utils/email.utils.js";
import { PUBLIC_ASSIGNABLE_ROLES, ROLES, isSuperAdminEmail, toSafeUser } from "../../config/roles.js";

const cancelHostedEventsForDeletedOrganizer = async (organizerId) => {
  const hostedEvents = await Event.find({ createdBy: organizerId });
  const eventIds = hostedEvents.map((event) => event._id);

  if (eventIds.length === 0) {
    return { eventIds, cancelledBookings: 0 };
  }

  const activeBookings = await Booking.find({
    event: { $in: eventIds },
    status: { $ne: "CANCELLED" },
  })
    .populate("user", "name email")
    .populate("event", "title date location");

  const confirmedBookings = activeBookings.filter((booking) => booking.status === "CONFIRMED");

  await Promise.allSettled(
    confirmedBookings
      .filter((booking) => booking.user?.email && booking.event)
      .map((booking) =>
        sendEventCancelledEmail(
          booking.user,
          booking.event,
          booking,
          "The organizer account for this event was deleted.",
        ),
      ),
  );

  await Booking.updateMany(
    { event: { $in: eventIds }, status: { $ne: "CANCELLED" } },
    { $set: { status: "CANCELLED" } },
  );

  await Event.updateMany(
    { _id: { $in: eventIds } },
    { $set: { status: "CANCELLED", registeredCount: 0 } },
  );

  return { eventIds, cancelledBookings: activeBookings.length };
};

// ─── Attendee & General User Routes ──────────────────────────────────────────

// @route  GET /api/users/profile
export const getMyProfile = async (req, res) => {
  try {
    // Fetch fresh data from DB to get fields like 'bio' that aren't in the token
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user: toSafeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route  PUT /api/users/profile
export const updateMyProfile = async (req, res) => {
  try {
    const { name, bio, phone, avatar, role } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (phone !== undefined) updates.phone = phone;
    if (avatar !== undefined) updates.avatar = avatar;

    if (!isSuperAdminEmail(req.user.email) && PUBLIC_ASSIGNABLE_ROLES.includes(role)) {
      updates.role = role;
    }
    
    // We use findByIdAndUpdate to avoid triggering the password pre-save hook
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, user: toSafeUser(user) });
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
    const user = await User.findById(userId);

    if (isSuperAdminEmail(user?.email)) {
      return res.status(403).json({
        success: false,
        message: "The fixed super admin account cannot be deleted.",
      });
    }

    // Cascade Deletion: Remove their bookings
    await Booking.deleteMany({ user: userId });

    const { eventIds, cancelledBookings } =
      user?.role === ROLES.ORGANIZER || user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN
        ? await cancelHostedEventsForDeletedOrganizer(userId)
        : { eventIds: [], cancelledBookings: 0 };
    
    await Transaction.deleteMany({
      userId,
    });

    // Finally, delete the user
    await User.findByIdAndDelete(userId);

    // Clear the JWT cookie
    res.cookie("eventM_token", "", { httpOnly: true, expires: new Date(0) });
    res.status(200).json({
      success: true,
      message: cancelledBookings > 0
        ? "Account deleted. Hosted events were cancelled and attendees were notified."
        : "Account deleted successfully",
      cancelledEvents: eventIds.length,
      cancelledBookings,
    });
  } catch (error) {
    console.error("Delete My Account Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ─── Organizer Routes ────────────────────────────────────────────────────────

// @route  GET /api/users/organizer-stats
export const getOrganizerStats = async (req, res) => {
  try {
    const organizerId = req.user.id;

    // 1. Get all events created by this organizer
    const events = await Event.find({ createdBy: organizerId })
      .select("_id title date price capacity registeredCount category status")
      .sort({ date: 1 });
    const eventIds = events.map(e => e._id);

    const totalEvents = eventIds.length;

    // 2. Load confirmed bookings so we can count bookings and ticket quantities.
    const confirmedBookings = await Booking.find({
      event: { $in: eventIds },
      status: "CONFIRMED"
    }).select("event tickets createdAt");

    const byEvent = new Map(events.map((event) => [
      event._id.toString(),
      {
        eventId: event._id,
        title: event.title,
        date: event.date,
        category: event.category,
        status: event.status,
        price: event.price,
        capacity: event.capacity,
        ticketsSold: 0,
        bookings: 0,
        revenue: 0,
      },
    ]));

    for (const booking of confirmedBookings) {
      const eventStats = byEvent.get(booking.event.toString());

      if (!eventStats) {
        continue;
      }

      eventStats.bookings += 1;
      eventStats.ticketsSold += booking.tickets;
      eventStats.revenue += (eventStats.price || 0) * booking.tickets;
    }

    const perEventSales = [...byEvent.values()].map((eventStats) => ({
      ...eventStats,
      sellThroughRate: eventStats.capacity
        ? Math.round((eventStats.ticketsSold / eventStats.capacity) * 100)
        : 0,
    }));

    const totalBookings = confirmedBookings.length;
    const totalTicketsSold = perEventSales.reduce((sum, eventStats) => sum + eventStats.ticketsSold, 0);
    const totalRevenue = perEventSales.reduce((sum, eventStats) => sum + eventStats.revenue, 0);

    res.status(200).json({
      success: true,
      stats: {
        totalEvents,
        totalBookings,
        totalTicketsSold,
        totalRevenue,
        perEventSales,
      }
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

    res.status(200).json({ success: true, count: users.length, total, page, users: users.map(toSafeUser) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route  GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    res.status(200).json({ success: true, user: toSafeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route  PUT /api/users/:id/role
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!PUBLIC_ASSIGNABLE_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (isSuperAdminEmail(targetUser.email)) {
      return res.status(403).json({
        success: false,
        message: "The fixed super admin role cannot be changed.",
      });
    }

    targetUser.role = role;
    await targetUser.save();

    res.status(200).json({ success: true, message: "Role updated", user: toSafeUser(targetUser) });
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

    if (isSuperAdminEmail(user.email)) {
      return res.status(403).json({
        success: false,
        message: "The fixed super admin account cannot be deleted.",
      });
    }

    // Cascade deletion
    await Booking.deleteMany({ user: userId });
    await cancelHostedEventsForDeletedOrganizer(userId);
    
    await Transaction.deleteMany({
      userId,
    });
    await User.findByIdAndDelete(userId);

    res.status(200).json({ success: true, message: "User completely removed from system" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
