import express from "express";
import { requireUser, requireAdmin } from "../middlewares/authMiddleware.js";
import {
  getComments,
  createComment,
  deleteComment,
} from "../controllers/commentController.js";
import { validate } from "../validators/validate.js";
const commentsRouter = express.Router();

commentsRouter.get("/", getComments); // this will return all visible comments for a match or tournament
commentsRouter.post("/", requireUser, validate, createComment); // this will block anonymous users from posting comments
commentsRouter.delete("/:id", requireAdmin, deleteComment); // this will block anyone who is not an admin from deleting

export default commentsRouter;
