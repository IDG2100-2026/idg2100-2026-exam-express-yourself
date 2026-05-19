const express = require('express');
const router = express.Router();
const { requireUser, requireAdmin } = require('../middlewares/authMiddleware');
const { getComments, createComment, deleteComment } = require('../controllers/commentController');

router.get('/', getComments);                       // this will return all visible comments for a match or tournament
router.post('/', requireUser, createComment);       // this will block anonymous users from posting comments
router.delete('/:id', requireAdmin, deleteComment); // this will block anyone who is not an admin from deleting

module.exports = router;
