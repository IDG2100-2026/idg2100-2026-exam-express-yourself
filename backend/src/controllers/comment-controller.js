import {
  getAllComments as getAllCommentsService,
  createComment as createCommentService,
  deleteComment as deleteCommentService,
} from "../services/comment-service.js";


// Get a paginated, filtered list of comments
export async function getComments(req, res, next) {
  try {
    const comments = await getAllCommentsService(req.validated);
    res.json(comments);
  } catch (err) {
    next(err);
  }
}


// Post a new comment on a match or tournament
export async function createComment(req, res, next) {
  try {
    const comment = await createCommentService(req.userId, req.validated);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}


// Mark a comment as deleted (admin only)
export async function deleteComment(req, res, next) {
  try {
    await deleteCommentService(req.params.id);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    next(err);
  }
}
