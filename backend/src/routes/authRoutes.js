import express from "express";
import { registerUserController, loginUserController } from "../controllers/authController.js";
import {
  validateRegister,
  validateLogin,
} from "../validators/userValidator.js";
import { validate } from "../validators/validate.js";

const authRouter = express.Router();

authRouter.post("/register", validateRegister(), validate, registerUserController); // Create a new user
authRouter.post("/login", validateLogin(), validate, loginUserController) // Login an existing user

export default authRouter;