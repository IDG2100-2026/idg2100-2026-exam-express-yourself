import express from "express";
import { adminRequired } from "../middleware/user.auth.js";
import commentController from "../controllers/commentController.js";
const commentRoute = express.Router();

commentRoute.get("/comments", adminRequired, commentController.getAllComments);
commentRoute.delete(
  "/comments/:id",
  adminRequired,
  commentController.deleteComment,
);

export default commentRoute;
