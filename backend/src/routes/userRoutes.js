import express from 'express';
import { body, validationResult } from 'express-validator';
import { requireUser, requireAdmin } from '../middlewares/authMiddleware.js';
import { getAllUsers, getUser, registerUser, loginUser, updateUser, banUser } from '../controllers/userController.js';

const userRouter = express.Router();
// these are the validation rules that will run before the register controller
const registerRules = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('age').isInt({ min: 18 }).withMessage('You must be at least 18 years old'),
]; // TODO: Move these to its own validation folder

// this will check if all the validation rules passed
// if there are errors it will send them back and stop the request from reaching the controller
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}; // TODO: Move to its own validation folder

// this will run the validation rules and then the validate check before registering
userRouter.post('/register', registerRules, validate, registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/', requireAdmin, getAllUsers);       // this will block anyone who is not an admin
userRouter.get('/:id', getUser);
userRouter.patch('/:id', requireUser, updateUser);   // this will block anonymous users
userRouter.post('/:id/ban', requireAdmin, banUser);  // this will block anyone who is not an admin

export default userRouter
