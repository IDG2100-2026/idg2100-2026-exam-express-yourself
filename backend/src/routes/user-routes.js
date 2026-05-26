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
userRouter.get("/:id", getUser);


userRouter.use(authenticate);


// Authenticated users
userRouter.patch("/:id", authorize("admin", "user"), validateUpdateUser(), validate, updateUser);


// Admin only
userRouter.get("/", authorize("admin"), validateGetUsers(), validate, getUsers);
userRouter.post("/:id/ban", authorize("admin"), banUser);
userRouter.post("/:id/make-admin", authorize("admin"), makeAdmin);


export default userRouter;
