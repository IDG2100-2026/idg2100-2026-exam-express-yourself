import express from "express";
import {
  validateRegister,
  validateLogin,
  validateGetUsers,
  validateUpdateUser,
} from "../validators/user-validator.js";
import { validate } from "../validators/validate.js";
import {
  getUsers,
  getUser,
  updateUser,
  banUser,
  makeAdmin,
} from "../controllers/user-controller.js";
import { authenticate, authorize } from "../middlewares/auth-middleware.js";

const userRouter = express.Router();


// Public routes
userRouter.get("/:id", getUser); // get a user profile


userRouter.use(authenticate);


// Authenticated users
userRouter.patch("/:id", authorize("admin", "user"), validateUpdateUser(), validate, updateUser); // update a user profile


// Admin only
userRouter.get("/", authorize("admin"), validateGetUsers(), validate, getUsers); // get all users
userRouter.post("/:id/ban", authorize("admin"), banUser); // ban a user
userRouter.post("/:id/make-admin", authorize("admin"), makeAdmin); // make a user an admin


export default userRouter;
