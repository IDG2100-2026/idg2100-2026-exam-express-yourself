import mongoose from "mongoose";
import { MAX_COMMENT_LENGTH, MIN_COMMENT_LENGTH } from "../config/constants.js";

const commentSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: MIN_COMMENT_LENGTH,
      maxlength: MAX_COMMENT_LENGTH,
    },
    // Polymorphic: comment can belong to a Match or Tournament
    targetType: {
      type: String,
      enum: ["Match", "Tournament"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    // Soft delete — keeps data for recovery
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
