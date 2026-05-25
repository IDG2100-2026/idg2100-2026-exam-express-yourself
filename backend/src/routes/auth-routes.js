import express from "express";
import {
  registerUserController,
  loginUserController,
  createAccessToken,
  logoutUser,
  verifyEmailController
} from "../controllers/auth-controller.js";
import {
  validateRegister,
  validateLogin,
} from "../validators/user-validator.js";
import { validate } from "../validators/validate.js";
import { authenticate, authorize } from "../middlewares/auth-middleware.js";
import cookieParser from "cookie-parser";

const authRouter = express.Router();
authRouter.use(cookieParser(process.env.COOKIE_SECRET));

authRouter.post(
  "/register",
  validateRegister(),
  validate,
  registerUserController,
); // Create a new user

authRouter.get("/verify-email", verifyEmailController);

authRouter.post("/login", validateLogin(), validate, loginUserController); // Login an existing user

authRouter.post("/sessions/token", createAccessToken); // to get a new access token after expire
authRouter.delete("/sessions/current", logoutUser); // on user logout

export default authRouter;
