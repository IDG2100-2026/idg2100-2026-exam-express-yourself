const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { requireUser, requireAdmin } = require('../middlewares/authMiddleware');
const { getAllUsers, getUser, registerUser, loginUser, updateUser, banUser } = require('../controllers/userController');

// these are the validation rules that will run before the register controller
const registerRules = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('age').isInt({ min: 18 }).withMessage('You must be at least 18 years old'),
];

// this will check if all the validation rules passed
// if there are errors it will send them back and stop the request from reaching the controller
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// this will run the validation rules and then the validate check before registering
router.post('/register', registerRules, validate, registerUser);
router.post('/login', loginUser);
router.get('/', requireAdmin, getAllUsers);       // this will block anyone who is not an admin
router.get('/:id', getUser);
router.patch('/:id', requireUser, updateUser);   // this will block anonymous users
router.post('/:id/ban', requireAdmin, banUser);  // this will block anyone who is not an admin

module.exports = router;
