import {
  registerUser,
  authenticateUser,
  createSession,
  resetPassword,
  resetPasswordRequest,
} from "../services/auth-service.js";
import { matchedData } from "express-validator";
import { Session } from "../models/Session.js";
import User from "../models/User.js";
import { signedAccessToken } from "../utils/jwt.js";
import { REFRESH_TOKEN_TTL } from "../config/auth-config.js";
import { BusinessLogicError } from "../utils/errors.js";
import { TokenVerification } from "../models/TokenVerification.js";
import { sendVerificationMail } from "../services/email-service.js";

// helper function so we don't have to write duplicated code.
const getAccessToken = (user) => {
  return signedAccessToken({
    userId: user._id.toString(),
    role: user.role,
  });
};
// POST /api/users/register
export const registerUserController = async (req, res, next) => {
  try {
    const userData = matchedData(req); // get only validated fields
    const newUser = await registerUser(userData); // gives the userData that the user inputted to registerUser in authService

    const verificationToken = await TokenVerification.create({
      // generates  verification token linked to the user
      userId: newUser._id,
    });
    await sendVerificationMail(newUser.email, verificationToken.token); // this is the to and token in sendVerificationMail in service.

    res.status(201).json({ message: "User registered successfully", newUser }); // Success msg, user was created successfully
  } catch (err) {
    next(err); // global error handling middleware
  }
};

export const verifyEmailController = async (req, res, next) => {
  try {
    const { code } = req.query; // get the code from url
    if (!code)
      throw new BusinessLogicError("Verification code is required", 400);

    const token = await TokenVerification.findOne({ token: code }); // finds the token in db

    if (!token)
      throw new BusinessLogicError("Invalid or expired verification code", 400);

    await User.findByIdAndUpdate(token.userId, { isVerified: true }); // marking the user as verified

    await token.deleteOne(); // delete the used or expired token
    res
      .status(200)
      .json({ message: "email verified successfully! You can now login" });
  } catch (err) {
    next(err);
  }
};

export const forgotPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new BusinessLogicError("email is required", 400);

    await resetPasswordRequest(email);
    res.json({
      message: "If the email exists, a password reset link has been sent",
    });
  } catch (err) {
    next(err);
  }
};

export const resetPasswordController = async (req, res, next) => {
  try{
    const { code, newPassword } = req.body;
    if(!code || !newPassword) throw new BusinessLogicError("code and password are required", 400);

    await resetPassword(code, newPassword);

    res.status(201).json({message: "Password has been changes successfully"});
  }catch(err){
    next(err);
  }
}

// POST /api/users/login
export const loginUserController = async (req, res, next) => {
  try {
    const { email, password } = matchedData(req); // destructure only email and password from the data
    const user = await authenticateUser(email, password); // verifies credentials from authService

    // create a session in db
    const refreshToken = await createSession(
      user,
      req.ip,
      req.headers["user-agent"],
    );

    // Short lived access token with user id and role
    const accessToken = getAccessToken(user);

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
  } catch (err) {
    next(err); // global error handling middleware
  }
};

// POST /sessions/refresh. Get a new access token from a valid refresh token
export const createAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.signedCookies?.refreshToken; // extracting the refresh token from the signed cookie
    if (!refreshToken)
      throw new BusinessLogicError("No refresh token provided", 401); // cookie expired or never logged in

    const session = await Session.findOne({ refreshToken }); // looking up the session from db.
    if (!session) throw new BusinessLogicError("Invalid refresh token", 401); // session expired, revoked or never existed

    const user = await User.findById(session.userId); // get the user linked to this session
    if (!user) throw new BusinessLogicError("User not found", 404); // did not find the user

    const accessToken = getAccessToken(user); // generate a new short lived access token

    // return access token with minimal user info for frontend
    return res.status(200).json({
      accessToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err); // global error handler
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const refreshToken = req.signedCookies?.refreshToken;
    if (!refreshToken)
      throw new BusinessLogicError("No refresh token provided", 401);

    const session = await Session.findOneAndDelete({ refreshToken });
    if (!session) throw new BusinessLogicError("Session not found", 401);

    res.clearCookie("refreshToken", {
      // deletes the cookie from the client side
      signed: true,
      httpOnly: true,
      path: req.baseUrl + "/sessions",
    });
    return res.status(200).json({ message: "logged out successfully" });
  } catch (err) {
    next(err);
  }
};
