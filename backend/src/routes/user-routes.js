import express from "express";
import {
  validateRegister,
  validateLogin,
  validateUpdateUser,
} from "../validators/user-validator.js";
import { validate } from "../validators/validate.js";
import {
  getAllUsers,
  getUser,
  updateUser,
  banUser,
  makeAdmin,
} from "../controllers/user-controller.js";
import { authenticate, authorize } from "../middlewares/auth-middleware.js";

const userRouter = express.Router();

userRouter.get("/:id", getUser); // public — profile pages don't require login

userRouter.use(authenticate);

userRouter.get("/", authorize("admin"), getAllUsers);

userRouter.patch(
  "/:id",
  authorize("admin", "user"),
  validateUpdateUser(),
  validate,
  updateUser,
);

userRouter.post("/:id/ban", authorize("admin"), banUser);

userRouter.post("/:id/make-admin", authorize("admin"), makeAdmin);

export default userRouter;
