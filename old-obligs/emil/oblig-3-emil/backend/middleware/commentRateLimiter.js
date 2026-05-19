import rateLimit from "express-rate-limit";

// Comment limiter, so users can not spam comments!
export const commentRateLimiter = rateLimit({
  windowMs: 5000, // 1 second window
  max: 5,
  handler: (req, res) => {
    res
      .status(429)
      .json({ message: "Slow down! You are posting comments too fast." });
  },
});
