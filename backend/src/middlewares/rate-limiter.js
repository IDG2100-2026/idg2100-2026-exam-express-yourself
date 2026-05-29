import rateLimit from "express-rate-limit";
import { logIncident } from "../services/security-incidents-service.js";
import { RATE_LIMIT_WINDOW } from "../config/constants.js";

// Prevent comment spam
export const commentRateLimiter = rateLimit({
  windowMs: 5000,
  max: 5,
  handler: (req, res) => {
    res
      .status(429)
      .json({ error: "Slow down! You are posting comments too fast." });
  },
});

// Strict limiter for forgot-password to prevent email bombing
export const forgotPasswordRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW,
  max: 5,
  handler: async (req, res) => {
    logIncident({
      type: "rate-limit",
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "unknown",
    }).catch(() => {});

    res
      .status(429)
      .json({
        error:
          "Too many password reset attempts. Please try again in 15 minutes.",
      });
  },
});

export const resendVerificationEmail = rateLimit({
  windowMs: RATE_LIMIT_WINDOW, // 15 minutes
  max: 3,
  handler: async (req, res) => {
    logIncident({
      type: "rate-limit",
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "unknown",
    }).catch(() => {});

    res
      .status(429)
      .json({
        error:
          "Too many resend verification email attempts. Please try again in 15 minutes.",
      });
  },
});

// General API rate limiter. logs incidents to DB
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  handler: async (req, res) => {
    logIncident({
      type: "rate-limit",
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "unknown",
    }).catch(() => {}); // fire and forget, don't block the response

    res.status(429).json({ error: "Too many requests. Please slow down." });
  },
});
