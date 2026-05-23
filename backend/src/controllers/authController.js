import {
  registerUser,
  authenticateUser,
  createSession,
} from "../services/authService.js";
import { matchedData } from "express-validator";
import { Session } from "../models/Sessions.js";
import User from "../models/User.js";
import { signedAccessToken } from "../utils/jwt.js";
import { REFRESH_TOKEN_TTL } from "../config/auth.config.js";
import { BusinessLogicError } from "../utils/errors.js";

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
    res.status(201).json({ message: "User registered successfully", newUser }); // Success msg, user was created successfully
  } catch (err) {
    next(err); // global error handling middleware
  }
};
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
      message: "Login successful",
      userId: user._id, // identifier for the user
      username: user.username, // display name
      role: user.role, // for client side auth
      eloRating: user.eloRating, // players elo rating
      profileImageUrl: user.profileImageUrl, // for ui display of avatar img
      appearance: user.appearance, // user's ui preference
      accessToken,
    });
  } catch (err) {
    next(err); // global error handling middleware
  }
};

// POST /sessions/refresh. Get a new access token from a valid refresh token 
export const createAccessToken = async (req, res, next) => { // TODO: delete this after creating the route!
    try{
        const refreshToken = req.signedCookies?.refreshToken; // extracting the refresh token from the signed cookie
        if(!refreshToken) throw new BusinessLogicError("No refresh token provided", 401); // cookie expired or never logged in

        const session = await Session.findOne({refreshToken}); // looking up the session from db. 
        if(!session) throw new BusinessLogicError("Invalid refresh token", 401); // session expired, revoked or never existed

        const user = await User.findById(session.userId); // get the user linked to this session 
        if(!user) throw new BusinessLogicError("User not found", 404); // did not find the user

        const accessToken = getAccessToken(user); // generate a new short lived access token 

        // return access token with minimal user info for frontend
        return res.status(200).json({accessToken, user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }});
    }catch(err){
        next(err); // global error handler
    }
}
