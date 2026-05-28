import express from "express";
import {
  registerUserController,
  loginUserController,
  createAccessToken,
  logoutUser,
  verifyEmailController,
  resetPasswordController,
  forgotPasswordController,
} from "../controllers/auth-controller.js";
import {
  validateRegister,
  validateLogin,
} from "../validators/user-validator.js";
import {
  validatePasswordReset,
  validateForgotPassword,
} from "../validators/passwordResetValidator.js";
import { validate } from "../validators/validate.js";
import { authenticate, authorize } from "../middlewares/auth-middleware.js";
import { apiRateLimiter, forgotPasswordRateLimiter } from "../middlewares/rate-limiter.js";
import cookieParser from "cookie-parser";

const authRouter = express.Router();
authRouter.use(cookieParser(process.env.COOKIE_SECRET));

authRouter.post(
  "/register",
  apiRateLimiter,
  validateRegister(),
  validate,
  registerUserController,
); // Create a new user

authRouter.post("/forgot-password", forgotPasswordRateLimiter, validateForgotPassword(), validate, forgotPasswordController); // sends the email with reset link
authRouter.post(
  "/reset-password",
  validatePasswordReset(),
  validate,
  resetPasswordController,
); // changes the password

authRouter.get(
  "/verify-email",
  apiRateLimiter,
  verifyEmailController,
);

authRouter.post("/login", apiRateLimiter, validateLogin(), validate, loginUserController); // Login an existing user

authRouter.post("/sessions/token", createAccessToken); // to get a new access token after expire
authRouter.delete("/sessions/current", logoutUser); // on user logout

export default authRouter;
