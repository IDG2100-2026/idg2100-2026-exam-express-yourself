import rateLimit from "express-rate-limit";
import SecurityIncident from "../models/SecurityIncident.js";

// Prevent comment spam
export const commentRateLimiter = rateLimit({
  windowMs: 5000,
  max: 5,
  handler: (req, res) => {
    res.status(429).json({ error: "Slow down! You are posting comments too fast." });
  },
});

// General API rate limiter — logs incidents to DB
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  handler: async (req, res) => {
    SecurityIncident.create({
      type: "rate-limit",
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "unknown",
    }).catch(() => {}); // fire and forget — don't block the response

    res.status(429).json({ error: "Too many requests. Please slow down." });
  },
});
