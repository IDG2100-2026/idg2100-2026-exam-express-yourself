import express from "express";
import { registerUserController } from "../controllers/authController.js";
import {
  validateRegister,
  validateLogin,
} from "../validators/userValidator.js";
import { validate } from "../validators/validate.js";

const authRouter = express.Router();

authRouter.post("/register", validateRegister(), validate, registerUserController);

export default authRouter;