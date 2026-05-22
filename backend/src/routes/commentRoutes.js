import express from "express";
import { requireUser, requireAdmin } from "../middlewares/authMiddleware.js";
import { commentRateLimiter } from "../middlewares/rateLimiter.js";
import { getComments, createComment, deleteComment } from "../controllers/commentController.js";

const commentsRouter = express.Router();

commentsRouter.get("/", getComments);
commentsRouter.post("/", requireUser, commentRateLimiter, createComment);
commentsRouter.delete("/:id", requireAdmin, deleteComment);

export default commentsRouter;
