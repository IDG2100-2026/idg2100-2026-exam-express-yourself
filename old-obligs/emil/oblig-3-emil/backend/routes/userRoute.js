import express from "express";
import userController from "../controllers/userController.js";
import userValidator from "../validators/userValidator.js";
import { validate } from "../validators/validate.js";
import { validateUpdateUser } from "../validators/userValidator.js";
import { adminRequired } from "../middleware/user.auth.js";
const userRouter = express.Router();


userRouter.get("/users", userController.getAllUsers); // all users
userRouter.get("/users/:id", validate, userController.getAUser); // get specific user via id

userRouter.post(
  "/users",
  userValidator.validateUser(),
  validate,
  userController.createUser,
); // creates a new user

userRouter.put(
  "/users/:id/update-profile",
  validateUpdateUser(),
  userController.updateUser,
  validate,
); // updates existing user

userRouter.put(
  "/users/:id/ban",
  adminRequired,
  userController.banUser,
  validate,
); // Updates if user is banned or not!

export default userRouter;
