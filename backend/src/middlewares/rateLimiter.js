import rateLimit from "express-rate-limit";

// Prevent comment spam
export const commentRateLimiter = rateLimit({
  windowMs: 5000,
  max: 5,
  handler: (_req, res) => {
    res
      .status(429)
      .json({ error: "Slow down! You are posting comments too fast." });
  },
});

// General API rate limiter (for security incident tracking)
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  handler: (req, res) => {
    console.warn(
      `Rate limit hit — IP: ${req.ip}, User-Agent: ${req.headers["user-agent"]}`
    );
    res.status(429).json({ error: "Too many requests. Please slow down." });
  },
});
