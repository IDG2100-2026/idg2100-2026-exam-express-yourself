import mongoose from "mongoose";
import {
  MIN_COMMENT_LENGTH,
  MAX_COMMENT_LENGTH,
  COMMENT_TARGET_TYPES,
} from "../config/constants.js";

const commentSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Author is required. [schema]"],
      ref: "User",
    },
    text: {
      type: String,
      trim: true,
      required: [true, "Text is required. [schema]"],
      minLength: [
        MIN_COMMENT_LENGTH,
        `Text must be between ${MIN_COMMENT_LENGTH} and ${MAX_COMMENT_LENGTH} characters. [schema]`,
      ],
      maxLength: [
        MAX_COMMENT_LENGTH,
        `Text must be between ${MIN_COMMENT_LENGTH} and ${MAX_COMMENT_LENGTH} characters. [schema]`,
      ],
    },
    targetType: {
      type: String,
      required: [true, "Target type is required. [schema]"],
      enum: {
        values: COMMENT_TARGET_TYPES,
        message: `Target type must be one of: ${COMMENT_TARGET_TYPES.join(", ")}. [schema]`,
      },
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Target ID is required. [schema]"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Comment = mongoose.model("Comment", commentSchema, "comments");

export default Comment;
