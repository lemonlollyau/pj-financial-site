// Vercel serverless function: receives the website enquiry form and emails it to P & J.
//
// Required (Vercel > Project > Settings > Environment Variables):
//   RESEND_API_KEY  – API key from https://resend.com, for a Resend account where
//                     pjfinancialsolutions.com.au is a verified sending domain.
// Optional overrides:
//   ENQUIRY_TO      – where enquiries go (comma-separate for more).
//                     Default: admin@pjfinancialsolutions.com.au
//   ENQUIRY_FROM    – sender. Default: "P & J Website <website@pjfinancialsolutions.com.au>"
//
// GET /api/enquiry returns { ok, configured } so the setup can be checked without
// sending an email. No secrets live in this file or in any response.

const DEFAULT_TO = "admin@pjfinancialsolutions.com.au";
const DEFAULT_FROM = "P & J Website <website@pjfinancialsolutions.com.au>";
const LIMITS = { name: 120, email: 200, phone: 40, need: 60, message: 4000 };
const NEEDS = ["Home loan", "Refinance", "Commercial finance", "Equipment or vehicle finance", "Something else"];

function clean(value, max, singleLine) {
  let s = String(value || "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  if (singleLine) s = s.replace(/[\r\n]+/g, " ");
  return s.trim().slice(0, max);
}

function config() {
  return {
    key: process.env.RESEND_API_KEY || "",
    to: (process.env.ENQUIRY_TO || DEFAULT_TO).split(",").map((s) => s.trim()).filter(Boolean),
    from: process.env.ENQUIRY_FROM || DEFAULT_FROM,
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    return res.status(200).json({ ok: true, configured: Boolean(config().key) });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  // Honeypot: real people never fill this hidden field. Pretend success, send nothing.
  if (clean(body.website, 200, true)) {
    return res.status(200).json({ ok: true });
  }

  const data = {
    name: clean(body.name, LIMITS.name, true),
    email: clean(body.email, LIMITS.email, true),
    phone: clean(body.phone, LIMITS.phone, true),
    need: clean(body.need, LIMITS.need, true),
    message: clean(body.message, LIMITS.message, false),
  };
  if (!NEEDS.includes(data.need)) data.need = "Something else";

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
  if (!data.name || !emailOk || body.consent !== "yes") {
    return res.status(400).json({ ok: false, error: "Name, a valid email and consent are required." });
  }

  const cfg = config();
  if (!cfg.key) {
    console.error("Enquiry form is not configured: set RESEND_API_KEY in Vercel.");
    return res.status(500).json({ ok: false, error: "Form not configured." });
  }

  const sentAt = new Date().toLocaleString("en-AU", { timeZone: "Australia/Perth", dateStyle: "medium", timeStyle: "short" });
  const text = [
    "New enquiry from the P & J website",
    "",
    "Name:         " + data.name,
    "Email:        " + data.email,
    "Phone:        " + (data.phone || "not given"),
    "Looking for:  " + data.need,
    "Sent:         " + sentAt + " (Perth time)",
    "",
    "Message:",
    data.message || "(none)",
    "",
    "Reply to this email to respond directly to " + data.name + ".",
    "The sender ticked the consent box on the contact form.",
  ].join("\n");

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + cfg.key, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: cfg.from,
        to: cfg.to,
        reply_to: data.email,
        subject: "Website enquiry: " + data.need + " – " + data.name,
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
