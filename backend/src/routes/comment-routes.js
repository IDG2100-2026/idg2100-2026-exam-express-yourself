import express from "express";
import { commentRateLimiter } from "../middlewares/rate-limiter.js";
import { getComments, createComment, deleteComment } from "../controllers/comment-controller.js";
import { authenticate, authorize } from "../middlewares/auth-middleware.js";
const commentsRouter = express.Router();

// Public — anyone can read comments on a tournament or match
commentsRouter.get("/", getComments);

// Authenticated routes
commentsRouter.post("/", authenticate, authorize("user", "admin"), commentRateLimiter, createComment);
commentsRouter.delete("/:id", authenticate, authorize("admin"), deleteComment);

export default commentsRouter;
