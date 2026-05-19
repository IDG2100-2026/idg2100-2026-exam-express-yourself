import mongoose from "mongoose";

// this defines what a comment looks like in the database
// a comment can belong to either a match or a tournament
const commentSchema = new mongoose.Schema(
  {
    // this will store who wrote the comment
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: { type: String, required: true, maxlength: 1000 }, // this will limit comment length to 1000 characters

    // this will tell us if the comment is on a match or a tournament
    targetType: { type: String, enum: ["Match", "Tournament"], required: true },

    // this will store the id of the match or tournament being commented on
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },

    // this will be set to true when an admin deletes a comment
    // we keep the document in the database instead of removing it, this is called a soft delete
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Comment = mongoose.model("Comment", commentSchema);
