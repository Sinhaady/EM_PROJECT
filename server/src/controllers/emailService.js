import nodemailer from "nodemailer"; // 💥 FIXED: CommonJS to ES Module

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEventConfirmationEmail = async ({ to, userName, event }) => { // 💥 FIXED: Export syntax
  try {
    const { title, description, date, location, category } = event;

    const formattedDate = new Date(date).toLocaleString("en-IN", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #f4f4f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 32px; color: white; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .header p { margin: 8px 0 0; opacity: 0.85; font-size: 14px; }
          .body { padding: 32px; }
          .greeting { font-size: 18px; color: #111827; font-weight: 600; margin-bottom: 8px; }
          .message { color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 28px; }
          .card { background: #f9fafb; border-radius: 10px; padding: 24px; border-left: 4px solid #6366f1; }
          .event-title { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 16px; }
          .detail-row { display: flex; align-items: flex-start; margin-bottom: 12px; gap: 10px; }
          .detail-label { font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; min-width: 80px; margin-top: 2px; }
          .detail-value { font-size: 14px; color: #374151; font-weight: 500; }
          .footer { padding: 24px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
          .badge { display: inline-block; background: #ede9fe; color: #7c3aed; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 You're In!</h1>
            <p>Your event registration is confirmed</p>
          </div>
          <div class="body">
            <div class="greeting">Hey ${userName} 👋</div>
            <div class="message">
              You've successfully registered for the event below. We're excited to have you!
              Here are your event details — save this email for reference.
            </div>
            <div class="card">
              <span class="badge">${category || "Event"}</span>
              <div class="event-title">${title}</div>
              <div class="detail-row">
                <span class="detail-label">📅 Date</span>
                <span class="detail-value">${formattedDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📍 Location</span>
                <span class="detail-value">${location || "Online / TBA"}</span>
              </div>
              ${description ? `
              <div class="detail-row">
                <span class="detail-label">📝 About</span>
                <span class="detail-value">${description}</span>
              </div>` : ""}
            </div>
          </div>
          <div class="footer">
            <p>Sent by <strong>Ventro</strong> · You registered for this event</p>
            <p>© ${new Date().getFullYear()} Ventro. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Ventro Events" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🎉 You're registered for "${title}"`,
      html,
    });
    
  } catch (error) {
    // Keeps email issues from silently killing your server threads
    console.error("Nodemailer execution failed:", error.message);
    throw error; 
  }
};