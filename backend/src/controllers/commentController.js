import Comment from "../models/Comment.js";

// GET /api/comments?targetType=Match&targetId=xxx&search=
export async function getComments(req, res, next) {
  try {
    const { targetType, targetId, search } = req.query;

    const filter = { isDeleted: false };
    if (targetType) filter.targetType = targetType;
    if (targetId) filter.targetId = targetId;
    if (search) {
      filter.text = { $regex: search, $options: "i" };
    }

    const comments = await Comment.find(filter)
      .populate("authorId", "username profileImageUrl")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    next(err);
  }
}

// POST /api/comments — logged-in users only
export async function createComment(req, res, next) {
  try {
    const { text, targetType, targetId } = req.body;

    const comment = await Comment.create({
      authorId: req.userId,
      text,
      targetType,
      targetId,
    });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/comments/:id — admin only (soft delete)
export async function deleteComment(req, res, next) {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!comment) return res.status(404).json({ error: "Comment not found" });

    res.json({ message: "Comment deleted" });
  } catch (err) {
    next(err);
  }
}
