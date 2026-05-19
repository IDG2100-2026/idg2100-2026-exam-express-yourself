import { Comment } from "../models/comments.js";

export async function getAllComments() {
  return await Comment.find().lean();
}

export async function createComment(userId, comment, targetType, targetId) {
  const newComment = new Comment({ userId, comment, targetId, targetType }); // userId and Comment will be shown, and targetId and targetType is where the comment is going
  return await newComment.save();
}

export async function deleteComment(id) {
  // Admin can delete hateful comments
  return await Comment.findByIdAndDelete(id);
}

export default {
  getAllComments,
  createComment,
  deleteComment,
};
