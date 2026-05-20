import express from "express";
import { body, validationResult } from "express-validator";
import { requireUser, requireAdmin } from "../middlewares/authMiddleware.js";
import {
  validateUser,
  validateUpdateUser,
  validateLogin,
} from "../validators/userValidator.js";
import {
  getAllUsers,
  getUser,
  registerUser,
  loginUser,
  updateUser,
  banUser,
} from "../controllers/userController.js";
import { validate } from "../validators/validate.js";

const userRouter = express.Router();

userRouter.post("/register", validateUser(), validate, registerUser);
userRouter.post("/login", validateLogin(), validate, loginUser);

userRouter.get("/", requireAdmin, getAllUsers); // this will block anyone who is not an admin
userRouter.get("/:id", validate, getUser);
userRouter.patch("/:id", requireUser, validateUpdateUser(), updateUser, validate); // this will block anonymous users
userRouter.post("/:id/ban", requireAdmin, banUser, validate); // this will block anyone who is not an admin

export default userRouter;
