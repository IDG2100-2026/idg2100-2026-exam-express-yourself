import express from "express";
import { validateGetComments, validateCreateComment } from "../validators/comment-validator.js";
import { validate } from "../validators/validate.js";
import { commentRateLimiter } from "../middlewares/rate-limiter.js";
import { getComments, createComment, deleteComment } from "../controllers/comment-controller.js";
import { authenticate, authorize } from "../middlewares/auth-middleware.js";

const commentsRouter = express.Router();


// Public routes
commentsRouter.get("/", validateGetComments(), validate, getComments);


commentsRouter.use(authenticate);


// Authenticated users
commentsRouter.post("/", authorize("user", "admin"), commentRateLimiter, validateCreateComment(), validate, createComment);


// Admin only
commentsRouter.delete("/:id", authorize("admin"), deleteComment);


export default commentsRouter;
