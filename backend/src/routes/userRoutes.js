import express from "express";
import { requireUser, requireAdmin } from "../middlewares/authMiddleware.js";
import { validateRegister, validateLogin, validateUpdateUser } from "../validators/userValidator.js";
import { validate } from "../validators/validate.js";
import {
  getAllUsers,
  getUser,
  loginUser,
  updateUser,
  banUser,
  makeAdmin,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/login", validateLogin(), validate, loginUser);
userRouter.get("/", requireAdmin, getAllUsers);
userRouter.get("/:id", getUser);
userRouter.patch("/:id", requireUser, validateUpdateUser(), validate, updateUser);
userRouter.post("/:id/ban", requireAdmin, banUser);
userRouter.post("/:id/make-admin", requireAdmin, makeAdmin);

export default userRouter;
