import Event from "../../models/Event.js";
import User from "../../models/User.js"; 
import { sendEventConfirmationEmail } from "./emailService.js";

const PUBLIC_EVENT_STATUS = "PUBLISHED";
const MODERATION_STATUSES = ["PENDING", "PUBLISHED", "REJECTED"];
const ORGANIZER_UPDATE_BLOCKLIST = new Set(["status", "createdBy", "registeredCount", "image"]);

const imageUrlFor = (_req, eventId) => `/api/events/${eventId}/image`;

const attachImageUrl = (req, event) => ({
  ...event,
  image: event.image
    ? { ...event.image, url: imageUrlFor(req, event._id) }
    : event.image,
});

const createImagePayload = (file) => ({
  url: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
  publicId: `local-event-${Date.now()}-${file.originalname}`,
});

const buildOrganizerUpdate = (body) => {
  return Object.fromEntries(
    Object.entries(body).filter(([key]) => !ORGANIZER_UPDATE_BLOCKLIST.has(key)),
  );
};

// ─── @route  POST /api/events ────────────────────────────────────────────────
// ─── @access Private (Organizers & Admins)
export const createEvent = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Event image is required" });
    }

    const eventData = {
      ...req.body,
      price: Number(req.body.price),
      capacity: Number(req.body.capacity),
      createdBy: req.user.id,
      image: createImagePayload(req.file),
      status: "PENDING",
    };

    const event = await Event.create(eventData);
    const result = event.toObject();
    if (result.image) result.image.url = imageUrlFor(req, result._id);
    res.status(201).json({ success: true, event: result });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You already have an event with this exact title.",
      });
    }
    console.error("Create Event Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// ─── @route  GET /api/events ─────────────────────────────────────────────────
// ─── @access Public
export const getAllEvents = async (req, res) => {
  try {
    const { category, type } = req.query;
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 100, 1), 100);
    let query = { status: PUBLIC_EVENT_STATUS };
    
    if (category) query.category = category;
    if (type) query.type = type;

    const events = await Event.find(query)
      .select("-image.url")
      .sort({ date: 1 })
      .limit(limit)
      .populate("createdBy", "name email")
      .lean();

    res.status(200).json({
      success: true,
      count: events.length,
      events: events.map((event) => attachImageUrl(req, event)),
    });
  } catch (error) {
    console.error("Get All Events Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── @route  GET /api/events/categories ──────────────────────────────────────
// ─── @access Public
// The public-category handler follows the private organizer feed below.
// @route  GET /api/events/mine
// @access Private (Organizers & Admins)
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user.id })
      .select("-image.url")
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .lean();

    res.status(200).json({
      success: true,
      count: events.length,
      events: events.map((event) => attachImageUrl(req, event)),
    });
  } catch (error) {
    console.error("Get My Events Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route  GET /api/events/categories
// @access Public
export const getUniqueCategories = async (req, res) => {
  try {
    const categories = await Event.distinct("category", { status: PUBLIC_EVENT_STATUS });
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
    const event = await Event.findById(req.params.id)
      .select("-image.url")
      .populate("createdBy", "name email")
      .lean();

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.status !== PUBLIC_EVENT_STATUS) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.status(200).json({ success: true, event: attachImageUrl(req, event) });
  } catch (error) {
    console.error("Get Event By ID Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── @route  PUT /api/events/:id ─────────────────────────────────────────────
// ─── @access Private (Event Owner or Admin)
export const updateEvent = async (req, res) => {
  try {
    const ownershipFilter = req.user.role === "super_admin"
      ? { _id: req.params.id }
      : { _id: req.params.id, createdBy: req.user.id };
    const event = await Event.findOneAndUpdate(ownershipFilter, buildOrganizerUpdate(req.body), {
      new: true,
      runValidators: true,
    }).select("-image.url");

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found or not editable" });
    }

    const result = event.toObject();
    if (result.image) result.image.url = imageUrlFor(req, result._id);
    res.status(200).json({ success: true, event: result });
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

    if (event.createdBy.toString() !== req.user.id && req.user.role !== "super_admin") {
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

// Serve the stored image as cacheable binary instead of embedding Base64 in API JSON.
export const getEventImage = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .select("image.url updatedAt")
      .lean();
    const storedUrl = event?.image?.url;

    // Older records use Cloudinary URLs; preserve compatibility with them.
    if (/^https?:\/\//i.test(storedUrl || "")) {
      res.set("Cache-Control", "public, max-age=86400");
      return res.redirect(302, storedUrl);
    }

    const match = storedUrl?.match(/^data:([^;]+);base64,(.+)$/s);

    if (!match) {
      return res.status(404).end();
    }

    res.set({
      "Content-Type": match[1],
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "Last-Modified": new Date(event.updatedAt).toUTCString(),
    });
    return res.send(Buffer.from(match[2], "base64"));
  } catch (error) {
    return res.status(404).end();
  }
};

// @route  GET /api/events/moderation
// @access Private (Fixed Super Admin)
export const getModerationEvents = async (req, res) => {
  try {
    const { status = "PENDING" } = req.query;

    if (!MODERATION_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid moderation status" });
    }

    const events = await Event.find({ status })
      .select("-image.url")
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .lean();

    res.status(200).json({
      success: true,
      count: events.length,
      events: events.map((event) => attachImageUrl(req, event)),
    });
  } catch (error) {
    console.error("Get Moderation Events Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route  PATCH /api/events/:id/moderation
// @access Private (Fixed Super Admin)
export const moderateEvent = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["PUBLISHED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Moderation status must be PUBLISHED or REJECTED",
      });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    )
      .select("-image.url")
      .populate("createdBy", "name email")
      .lean();

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.status(200).json({
      success: true,
      message: status === "PUBLISHED" ? "Event approved" : "Event rejected",
      event: attachImageUrl(req, event),
    });
  } catch (error) {
    console.error("Moderate Event Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
