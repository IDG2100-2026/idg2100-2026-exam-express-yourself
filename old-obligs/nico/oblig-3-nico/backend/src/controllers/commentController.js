const Comment = require('../models/Comment');

// GET /api/comments?targetType=Match&targetId=xxx
// also supports ?search= to filter comments by text content (admin use)
const getComments = async (req, res, next) => {
  try {
    // this will grab targetType, targetId and optional search from the url query
    const { targetType, targetId, search } = req.query;

    // this will build the filter, always hide deleted comments
    const filter = { isDeleted: false };
    if (targetType) filter.targetType = targetType;
    if (targetId) filter.targetId = targetId;

    // this will add a text search filter if a search term was given
    if (search) {
      filter.text = { $regex: search, $options: 'i' }; // this will match anywhere in the text, case insensitive
    }

    // this will find all comments that match the filter
    const comments = await Comment.find(filter)
      .populate('authorId', 'username'); // this will replace the author id with their username

    res.json(comments);
  } catch (err) {
    next(err); // this will send the error to the error handler middleware
  }
};

// POST /api/comments - logged in users only
const createComment = async (req, res, next) => {
  try {
    // this will grab the comment data from the request body
    const { text, targetType, targetId } = req.body;

    // this will create and save the comment in the database
    // authorId comes from req.userId which is set by the auth middleware, not from the body
    const comment = await Comment.create({
      authorId: req.userId,
      text,
      targetType,
      targetId,
    });

    res.status(201).json(comment); // 201 means something was created
  } catch (err) {
    next(err);
  }
};

// DELETE /api/comments/:id - admin only
const deleteComment = async (req, res, next) => {
  try {
    // this will set isDeleted to true instead of removing the comment from the database
    // soft delete means the data is still there if we ever need to recover it
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,      // this is the comment id from the url
      { isDeleted: true },
      { new: true }       // this will return the updated document
    );

    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getComments, createComment, deleteComment };
