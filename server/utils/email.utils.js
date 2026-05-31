import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

// ─── Base Email Transporter ──────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === "465", 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Internal helper function to send the actual email
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

// ─── 1. Welcome Email ────────────────────────────────────────────────────────
export const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Welcome to EventM, ${user.name}!</h2>
      <p>We are thrilled to have you on board.</p>
      <p>You can now browse events, book tickets, and manage your schedule all in one place.</p>
      <br>
      <p>Cheers,<br>The EventM Team</p>
    </div>
  `;
  return sendEmail({ to: user.email, subject: "Welcome to EventM!", html });
};

// ─── 2. Booking Confirmation ─────────────────────────────────────────────────
export const sendBookingConfirmation = async (user, event, booking) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Ticket Confirmed! 🎉</h2>
      <p>Hi ${user.name}, your booking for <strong>${event.title}</strong> is confirmed.</p>
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Date:</strong> ${new Date(event.date).toDateString()}</p>
        <p><strong>Location:</strong> ${event.location}</p>
        <p><strong>Tickets:</strong> ${booking.tickets}</p>
        <p><strong>Order ID:</strong> ${booking._id}</p>
      </div>
      <p>See you there!</p>
    </div>
  `;
  return sendEmail({ to: user.email, subject: `Booking Confirmed: ${event.title}`, html });
};

// ─── 3. Cancellation Email ───────────────────────────────────────────────────
export const sendCancellationEmail = async (user, event, booking, amountRefunded = 0) => {
  const refundText = amountRefunded > 0 
    ? `<p>A refund of <strong>₹${amountRefunded}</strong> has been initiated and will reflect in your account within 5-7 business days.</p>`
    : `<p>Since this was a free event, no refund is required.</p>`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Booking Cancelled</h2>
      <p>Hi ${user.name},</p>
      <p>Your booking for <strong>${event.title}</strong> has been successfully cancelled.</p>
      ${refundText}
      <p>We hope to see you at another event soon.</p>
    </div>
  `;
  return sendEmail({ to: user.email, subject: `Booking Cancelled: ${event.title}`, html });
};

// ─── 4. Password Reset Email ─────────────────────────────────────────────────
export const sendPasswordResetEmail = async (user, resetToken) => {
  // Assuming your frontend runs on this URL
  const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL;
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Please click the button below to set a new password.</p>
      <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Reset Password</a>
      <p style="margin-top: 20px; font-size: 12px; color: #777;">This link will expire in 15 minutes. If you did not request this, please ignore this email.</p>
    </div>
  `;
  return sendEmail({ to: user.email, subject: "EventM Password Reset", html });
};

// ─── 5. Organizer Alert ──────────────────────────────────────────────────────
export const sendOrganizerAlert = async (organizer, event, booking) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>New Ticket Sold! 🎟️</h2>
      <p>Hi ${organizer.name},</p>
      <p>You just sold <strong>${booking.tickets}</strong> ticket(s) for <strong>${event.title}</strong>.</p>
      <p>Log in to your dashboard to view your updated revenue and attendee list.</p>
    </div>
  `;
  return sendEmail({ to: organizer.email, subject: `New Booking for ${event.title}`, html });
};
