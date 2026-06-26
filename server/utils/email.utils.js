import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const fromAddress =
  process.env.EMAIL_FROM ||
  (process.env.EMAIL_USER ? `"Ventro Events" <${process.env.EMAIL_USER}>` : undefined);

const isSmtpConfigured = () =>
  Boolean(
    (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) ||
      (process.env.EMAIL_USER && process.env.EMAIL_PASS),
  );

const createTransporter = () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const transporter = isSmtpConfigured() ? createTransporter() : null;

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatDateTime = (date) =>
  new Date(date).toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });

const sendEmail = async ({ to, subject, html }) => {
  if (!transporter || !fromAddress) {
    console.warn("Email skipped: SMTP/EMAIL credentials are not configured.");
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error.message);
    return false;
  }
};

export const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Welcome to Ventro, ${escapeHtml(user.name)}!</h2>
      <p>You can now browse events, book tickets, and manage your schedule in one place.</p>
      <p>Cheers,<br>The Ventro Team</p>
    </div>
  `;

  return sendEmail({ to: user.email, subject: "Welcome to Ventro!", html });
};

export const sendBookingConfirmation = async (user, event, booking) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #111827;">
      <h2>Your booking is confirmed</h2>
      <p>Hi ${escapeHtml(user.name)}, your booking for <strong>${escapeHtml(event.title)}</strong> is confirmed.</p>
      <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> ${formatDateTime(event.date)}</p>
        <p><strong>Location:</strong> ${escapeHtml(event.location || "Online / TBA")}</p>
        <p><strong>Tickets:</strong> ${booking.tickets}</p>
        <p><strong>Booking ID:</strong> ${booking._id}</p>
      </div>
      <p>Keep this email handy. We will also remind you one day before the event.</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Booking confirmed: ${event.title}`,
    html,
  });
};

export const sendEventReminderEmail = async (user, event, booking) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #111827;">
      <h2>Your event is tomorrow</h2>
      <p>Hi ${escapeHtml(user.name)}, this is a reminder for <strong>${escapeHtml(event.title)}</strong>.</p>
      <div style="background: #eef2ff; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> ${formatDateTime(event.date)}</p>
        <p><strong>Location:</strong> ${escapeHtml(event.location || "Online / TBA")}</p>
        <p><strong>Tickets:</strong> ${booking.tickets}</p>
      </div>
      <p>See you there.</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Reminder: ${event.title} is tomorrow`,
    html,
  });
};

export const sendCancellationEmail = async (user, event, booking, amountRefunded = 0) => {
  const refundText =
    amountRefunded > 0
      ? `<p>A refund of <strong>Rs. ${amountRefunded}</strong> has been initiated.</p>`
      : "<p>No refund is required for this booking.</p>";

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Booking cancelled</h2>
      <p>Hi ${escapeHtml(user.name)},</p>
      <p>Your booking for <strong>${escapeHtml(event.title)}</strong> has been cancelled.</p>
      ${refundText}
    </div>
  `;

  return sendEmail({ to: user.email, subject: `Booking cancelled: ${event.title}`, html });
};

export const sendEventCancelledEmail = async (user, event, booking, reason = "The event has been cancelled.") => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #111827;">
      <h2>Event cancelled</h2>
      <p>Hi ${escapeHtml(user.name)},</p>
      <p><strong>${escapeHtml(event.title)}</strong> has been cancelled.</p>
      <div style="background: #fff1f2; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> ${formatDateTime(event.date)}</p>
        <p><strong>Location:</strong> ${escapeHtml(event.location || "Online / TBA")}</p>
        <p><strong>Tickets:</strong> ${booking.tickets}</p>
        <p><strong>Reason:</strong> ${escapeHtml(reason)}</p>
      </div>
      <p>Your booking has been cancelled automatically.</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Event cancelled: ${event.title}`,
    html,
  });
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL;
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Password reset request</h2>
      <p>Click the button below to set a new password.</p>
      <a href="${resetUrl}" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Reset password</a>
      <p style="font-size: 12px; color: #777;">This link expires in 15 minutes.</p>
    </div>
  `;

  return sendEmail({ to: user.email, subject: "Ventro password reset", html });
};

export const sendOrganizerAlert = async (organizer, event, booking) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>New ticket sold</h2>
      <p>Hi ${escapeHtml(organizer.name)},</p>
      <p>You sold <strong>${booking.tickets}</strong> ticket(s) for <strong>${escapeHtml(event.title)}</strong>.</p>
    </div>
  `;

  return sendEmail({ to: organizer.email, subject: `New booking for ${event.title}`, html });
};
