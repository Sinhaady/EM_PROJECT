import Event from "../../models/Event.js";

// ─── @route  POST /api/events ────────────────────────────────────────────────
// ─── @access Private (Organizers & Admins)
export const createEvent = async (req, res) => {
  try {
    // We spread the req.body to grab title, description, date, location, etc.
    // Note: We assume the image { url, publicId } is already uploaded and passed in the body.
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Event image is required" });
    }
   const eventData = {
      ...req.body,
      createdBy: req.user.id,
      image: {
        url: req.file.path,       // The live Cloudinary URL
        publicId: req.file.filename // The unique ID for future deletions
      }
    };
    const event = await Event.create(eventData);
    res.status(201).json({ success: true, event });

  } catch (error) {
    // Handle the unique index error (preventing an organizer from making duplicate event titles)
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
    // Basic Filtering Engine: Allows frontend to call /api/events?category=Tech&status=PUBLISHED
    const { category, status, type } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (type) query.type = type;

    // Fetch events, sorted by date (newest first), and attach the creator's name
    const events = await Event.find(query)
      .sort({ date: 1 })
      .populate("createdBy", "name email");

    res.status(200).json({ success: true, count: events.length, events });
  } catch (error) {
    console.error("Get All Events Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUniqueCategories = async (req, res) => {
  try {
    // MongoDB's .distinct() method scans the Event collection and returns an 
    // array of all the unique strings found in the "category" field.
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

    // CRITICAL OWNERSHIP CHECK
    // Ensure the user updating the event actually created it, unless they are an admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You are not authorized to edit this event" });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // Ensures capacity or price don't accidentally get set to negative numbers
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

    // CRITICAL OWNERSHIP CHECK
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
