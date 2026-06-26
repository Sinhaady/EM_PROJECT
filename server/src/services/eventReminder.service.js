import Booking from "../../models/Booking.js";
import { sendEventReminderEmail } from "../../utils/email.utils.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

let reminderTimer = null;

export const sendDueEventReminders = async () => {
  const now = new Date();
  const oneDayFromNow = new Date(now.getTime() + ONE_DAY_MS);

  const bookings = await Booking.find({
    status: "CONFIRMED",
    $or: [{ reminderSentAt: null }, { reminderSentAt: { $exists: false } }],
  })
    .populate("user", "name email")
    .populate({
      path: "event",
      select: "title date location category status",
      match: {
        status: "PUBLISHED",
        date: { $gt: now, $lte: oneDayFromNow },
      },
    })
    .limit(100);

  let sentCount = 0;

  for (const booking of bookings) {
    if (!booking.user?.email || !booking.event) {
      continue;
    }

    const sent = await sendEventReminderEmail(booking.user, booking.event, booking);

    if (sent) {
      booking.reminderSentAt = new Date();
      await booking.save();
      sentCount += 1;
    }
  }

  if (sentCount > 0) {
    console.log(`Sent ${sentCount} event reminder email(s).`);
  }

  return sentCount;
};

export const startEventReminderScheduler = () => {
  if (reminderTimer || process.env.NODE_ENV === "test") {
    return;
  }

  sendDueEventReminders().catch((error) => {
    console.error("Event reminder scan failed:", error.message);
  });

  reminderTimer = setInterval(() => {
    sendDueEventReminders().catch((error) => {
      console.error("Event reminder scan failed:", error.message);
    });
  }, ONE_HOUR_MS);
};
