import express from "express";
import {
  registerUserController,
  loginUserController,
  createAccessToken,
  logoutUser,
} from "../controllers/authController.js";
import {
  validateRegister,
  validateLogin,
} from "../validators/userValidator.js";
import { validate } from "../validators/validate.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import cookieParser from "cookie-parser";

const authRouter = express.Router();
authRouter.use(cookieParser(process.env.COOKIE_SECRET));

authRouter.post(
  "/register",
  validateRegister(),
  validate,
  registerUserController,
); // Create a new user

authRouter.post("/login", validateLogin(), validate, loginUserController); // Login an existing user

authRouter.post("/sessions/token", createAccessToken); // to get a new access token after expire
authRouter.delete("/sessions/current", logoutUser); // on user logout

export default authRouter;
