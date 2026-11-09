// Vercel serverless function: receives the contact form and emails it to the office.
//
// Environment variables (Vercel > Project > Settings > Environment Variables):
//   RESEND_API_KEY  – API key from https://resend.com (free tier is plenty)
//   ENQUIRY_TO      – where enquiries go, e.g. admin@pjfinancialsolutions.com.au
//   ENQUIRY_FROM    – a sender on a domain verified in Resend,
//                     e.g. "P&J Website <website@pjfinancialsolutions.com.au>"
//
// No secrets live in this file. If the variables are missing the function returns
// an error and the page tells the visitor to call or email instead.

const LIMITS = { name: 120, email: 200, phone: 40, need: 60, message: 4000 };

function clean(value, max) {
  return String(value || "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  // Honeypot: real people never fill this hidden field.
  if (clean(body.website, 200)) {
    return res.status(200).json({ ok: true });
  }

  const data = {};
  for (const key of Object.keys(LIMITS)) data[key] = clean(body[key], LIMITS[key]);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
  if (!data.name || !emailOk || body.consent !== "yes") {
    return res.status(400).json({ ok: false, error: "Name, a valid email and consent are required." });
  }

  const { RESEND_API_KEY, ENQUIRY_TO, ENQUIRY_FROM } = process.env;
  if (!RESEND_API_KEY || !ENQUIRY_TO || !ENQUIRY_FROM) {
    console.error("Enquiry form is not configured: set RESEND_API_KEY, ENQUIRY_TO and ENQUIRY_FROM.");
    return res.status(500).json({ ok: false, error: "Form not configured." });
  }

  const text = [
    "New website enquiry",
    "",
    "Name:    " + data.name,
    "Email:   " + data.email,
    "Phone:   " + (data.phone || "not given"),
    "Looking for: " + (data.need || "not given"),
    "",
    "Message:",
    data.message || "(none)",
    "",
    "The sender ticked the consent box on the contact page.",
  ].join("\n");

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: ENQUIRY_FROM,
        to: ENQUIRY_TO.split(",").map((s) => s.trim()).filter(Boolean),
        reply_to: data.email,
        subject: "Website enquiry: " + (data.need || "General") + " – " + data.name,
        text,
      }),
    });
    if (!r.ok) {
      console.error("Resend error", r.status, await r.text());
      return res.status(502).json({ ok: false, error: "Email service error." });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Enquiry send failed", err);
    return res.status(502).json({ ok: false, error: "Email service error." });
  }
};
