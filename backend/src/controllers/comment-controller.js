import {
  getAllComments as getAllCommentsService,
  createComment as createCommentService,
  deleteComment as deleteCommentService,
} from "../services/comment-service.js";


// Get a paginated, filtered list of comments (GET /api/comments?page=&limit=&targetType=&targetId=&search=)
export async function getComments(req, res, next) {
  const comments = await getAllCommentsService(req.validated);
  res.status(200);
  res.json(comments);
}


// Post a new comment on a match or tournament (POST /api/comments)
export async function createComment(req, res, next) {
  const comment = await createCommentService(req.userId, req.validated);
  res.status(201);
  res.json(comment);
}


// Mark a comment as deleted (DELETE /api/comments/:id)
export async function deleteComment(req, res, next) {
  await deleteCommentService(req.params.id);
  res.status(200);
  res.json({ message: "Comment deleted" });
}
