import express from 'express';
const commentsRouter = express.Router();
const { requireUser, requireAdmin } = require('../middlewares/authMiddleware');
const { getComments, createComment, deleteComment } = require('../controllers/commentController');

commentsRouter.get('/', getComments);                       // this will return all visible comments for a match or tournament
commentsRouter.post('/', requireUser, createComment);       // this will block anonymous users from posting comments
commentsRouter.delete('/:id', requireAdmin, deleteComment); // this will block anyone who is not an admin from deleting



export default commentsRouter;
