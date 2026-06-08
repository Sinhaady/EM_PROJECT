import Event from "../../models/Event.js";
import User from "../../models/User.js"; 
import { sendEventConfirmationEmail } from "./emailService.js";

// ─── @route  POST /api/events ────────────────────────────────────────────────
// ─── @access Private (Organizers & Admins)
export const createEvent = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Event image is required" });
    }
    const eventData = {
      ...req.body,
      createdBy: req.user.id,
      image: {
        url: req.file.path,       
        publicId: req.file.filename 
      }
    };
    const event = await Event.create(eventData);
    res.status(201).json({ success: true, event });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You already have an event with this exact title.",
      });
    }
    console.error("Create Event Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── @route  GET /api/events ─────────────────────────────────────────────────
// ─── @access Public
export const getAllEvents = async (req, res) => {
  try {
    const { category, status, type } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (type) query.type = type;

    const events = await Event.find(query)
      .sort({ date: 1 })
      .populate("createdBy", "name email");

    res.status(200).json({ success: true, count: events.length, events });
  } catch (error) {
    console.error("Get All Events Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── @route  GET /api/events/categories ──────────────────────────────────────
// ─── @access Public
export const getUniqueCategories = async (req, res) => {
  try {
    const categories = await Event.distinct("category");
    res.status(200).json({ 
      success: true, 
      count: categories.length, 
      categories 
    });
  } catch (error) {
    console.error("Get Categories Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── @route  GET /api/events/:id ─────────────────────────────────────────────
// ─── @access Public
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("createdBy", "name email");

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    console.error("Get Event By ID Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── @route  PUT /api/events/:id ─────────────────────────────────────────────
// ─── @access Private (Event Owner or Admin)
export const updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You are not authorized to edit this event" });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, event });
  } catch (error) {
    console.error("Update Event Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── @route  DELETE /api/events/:id ──────────────────────────────────────────
// ─── @access Private (Event Owner or Admin)
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You are not authorized to delete this event" });
    }

    await event.deleteOne();
    res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete Event Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── @route  POST /api/events/:eventId/join ──────────────────────────────────
// ─── @access Private
export const joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const user = await User.findById(req.user.id); 
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isAlreadyRegistered = event.attendees.some(
      (attendeeId) => attendeeId.toString() === user._id.toString()
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({ success: false, message: "Already registered for this event" });
    }

    event.attendees.push(user._id);
    await event.save();

    sendEventConfirmationEmail({
      to: user.email,
      userName: user.name,
      event: {
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        category: event.category,
      },
    }).catch((err) => console.error("Email send failed:", err));

    res.status(200).json({ success: true, message: "Successfully joined event!" });
  } catch (err) {
    console.error("Join Event Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};