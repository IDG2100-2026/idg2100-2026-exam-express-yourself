import mongoose from "mongoose";

import { MAX_COMMENT_LENGTH, MIN_COMMENT_LENGTH } from "../config/constants.js";

const commentSchema = new mongoose.Schema(
  {
    userId: {
      // So we can see who made the comment
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      trim: true,
    },
    comment: {
      // Need at least 5 characters and no more than 500 characters.
      type: String,
      required: true,
      trim: true,
      minLength: [
        MIN_COMMENT_LENGTH,
        `You need at least ${MIN_COMMENT_LENGTH} characters to leave a comment! `,
      ],
      maxLength: [
        MAX_COMMENT_LENGTH,
        `You can not leave a comment with more than ${MAX_COMMENT_LENGTH}`,
      ],
    },
    targetType: {
      // We can leave a comment on a game or a tournament
      type: String,
      enum: ["Game", "Tournament"],
    },
    targetId: {
      // check if the comment is leaved on a game or a tournament
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetType", // Either Game or Tournament
    },
  },
  {
    timestamps: true, // Gets the time when the comment is left!
    toJSON: {
      transform: (doc, pojo) => {
        delete pojo._id; // So we don't show the id of the user by mistake, we remove
        return pojo;
      },
    },
  },
);

export const Comment = mongoose.model("Comment", commentSchema);
