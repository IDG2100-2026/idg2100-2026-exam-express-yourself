import {
  registerUser,
  authenticateUser,
  createSession,
  resetPassword,
  resetPasswordRequest,
  verifyEmailService,
  resendUserVerification,
  createAccessTokenService,
  logoutUserService,
} from "../services/auth-service.js";
import { matchedData } from "express-validator";
import { getAccessToken } from "../utils/jwt.js";
import { REFRESH_TOKEN_TTL } from "../config/auth-config.js";
import { normalizeIp } from "../utils/normalize-ip.js";
import { BusinessLogicError } from "../utils/errors.js";

// POST /api/users/register
export const registerUserController = async (req, res, next) => {
  const userData = matchedData(req); // get only validated fields
  const newUser = await registerUser(userData); // gives the userData that the user inputted to registerUser in authService
  res
    .status(201)
    .json({
      message:
        "User registered successfully! Press the link that you got on your email to verify your account",
      newUser,
    }); // Success msg, user was created successfully
};

export const verifyEmailController = async (req, res, next) => {
  const { code } = req.query; // get the code from url
  await verifyEmailService(code);
  res
    .status(200)
    .json({ message: "Email verified successfully! You can now login" });
};

export const resendVerifyEmailController = async (req, res, next) => {
  const { email } = req.body;
  await resendUserVerification(email);
  res.status(200).json({ message: "Verification email resent" });
};

export const forgotPasswordController = async (req, res, next) => {
  const { email } = matchedData(req);
  await resetPasswordRequest(email);
  res.json({
    message: "If the email exists, a password reset link has been sent",
  });
};

export const resetPasswordController = async (req, res, next) => {
  const { code, newPassword } = req.body;
  await resetPassword(code, newPassword);

  res.status(200).json({ message: "Password has been changed successfully" });
};

// POST /api/users/login
export const loginUserController = async (req, res, next) => {
  const { email, password } = matchedData(req); // destructure only email and password from the data
  const user = await authenticateUser(email, password); // verifies credentials from authService

  // create a session in db
  const refreshToken = await createSession(
    user,
    normalizeIp(req.ip),
    req.headers["user-agent"],
  );

  // Short lived access token with user id and role
  const accessToken = getAccessToken(user, req.ip);

  // store refreshToken in a secure cookie
  res.cookie("refreshToken", refreshToken, {
    signed: true, // signs the cookie so the server knows if it has been tampered with
    maxAge: REFRESH_TOKEN_TTL, // cookie expires after this time
    httpOnly: true, // blocks javascript from reading the cookie. XSS secure
    path: req.baseUrl + "/sessions", // only sent to this endpoint
  });

  res.status(200).json({
    accessToken,
    user: {
      _id: user._id,
      username: user.username,
      role: user.role,
      eloRating: user.eloRating,
      profileImageUrl: user.profileImageUrl,
      appearance: user.appearance,
    },
  });
};

// POST /sessions/refresh. Get a new access token from a valid refresh token
export const createAccessToken = async (req, res, next) => {
  const refreshToken = req.signedCookies?.refreshToken; // extracting the refresh token from the signed cookie
  const { accessToken, user } = await createAccessTokenService(
    refreshToken,
    req.ip,
    req.headers["user-agent"],
  );

  // return access token with minimal user info for frontend
  return res.status(200).json({
    accessToken,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      eloRating: user.eloRating,
      profileImageUrl: user.profileImageUrl,
      appearance: user.appearance,
    },
  });
};

export const logoutUser = async (req, res, next) => {
  const refreshToken = req.signedCookies?.refreshToken;

  await logoutUserService(refreshToken);

  res.clearCookie("refreshToken", {
    // deletes the cookie from the client side
    signed: true,
    httpOnly: true,
    path: req.baseUrl + "/sessions",
  });
  return res.status(200).json({ message: "logged out successfully" });
};
