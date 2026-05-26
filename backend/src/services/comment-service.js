import Comment from "../models/Comment.js";
import { BusinessLogicError } from "../utils/errors.js";


// Get a paginated, filtered list of non-deleted comments
export async function getAllComments(filters) {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const filter = { isDeleted: false };

  if (filters.targetType !== undefined) {
    filter.targetType = filters.targetType;
  }
  if (filters.targetId !== undefined) {
    filter.targetId = filters.targetId;
  }
  if (filters.search !== undefined) {
    filter.text = { $regex: filters.search, $options: "i" };
  }

  const comments = await Comment.find(filter)
    .populate("authorId", "username profileImageUrl")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Comment.countDocuments(filter);

  return { page, limit, total, results: comments };
}


// Create a new comment on a match or tournament
export async function createComment(userId, commentData) {
  const text = commentData.text;
  const targetType = commentData.targetType;
  const targetId = commentData.targetId;

  const newComment = new Comment({
    authorId: userId,
    text: text,
    targetType: targetType,
    targetId: targetId,
  });

  const savedComment = await newComment.save();

  const populated = await savedComment.populate("authorId", "username profileImageUrl");

  return populated;
}


// Mark a comment as deleted without removing it from the database
export async function deleteComment(commentId) {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new BusinessLogicError("Comment not found", 404);
  }

  comment.isDeleted = true;
  await comment.save();

  return comment;
}
