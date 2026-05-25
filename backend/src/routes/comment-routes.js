import express from "express";
import { commentRateLimiter } from "../middlewares/rate-limiter.js";
import { getComments, createComment, deleteComment } from "../controllers/comment-controller.js";
import { authenticate, authorize } from "../middlewares/auth-middleware.js";
const commentsRouter = express.Router();
commentsRouter.use(authenticate);

commentsRouter.get("/", authorize("admin"), getComments);
commentsRouter.post("/", authorize("user", "admin"), commentRateLimiter, createComment);
commentsRouter.delete("/:id", authorize("admin"), deleteComment);

export default commentsRouter;
