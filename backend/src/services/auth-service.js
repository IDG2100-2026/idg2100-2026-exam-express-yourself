import User from "../models/User.js";
import { checkPassword, hashPassword } from "../utils/password-hash.js";
import { Session } from "../models/Session.js";
import { BusinessLogicError } from "../utils/errors.js";
import { ResetPassword } from "../models/passwordReset.js";
import {
  sendPasswordResetMail,
  sendVerificationMail,
} from "./email-service.js";
import { TokenVerification } from "../models/TokenVerification.js";
import { normalizeIp } from "../utils/normalize-ip.js";
import { getAccessToken } from "../controllers/auth-controller.js";

export const createSession = async (user, ip, agent) => {
  const session = await new Session({
    // creates a new session and storing user's id, ip and agent.
    userId: user._id,
    ip: ip,
    agent: agent,
  });
  await session.save(); // Saves the new session to db
  return session.refreshToken; // return sessions refresh token
};

export const registerUser = async (userData) => {
  const newUser = await new User({
    // creates a new User document
    username: userData.username,
    password: userData.password,
    email: userData.email,
    age: userData.age,
    role: userData.role || "user",
  });
  if (!newUser)
    throw new BusinessLogicError("Could not create a new user", 400); // If somethings wrong with the input, we trow a global error, and its picked up in next()

  await newUser.save(); // Saves to db. This triggers the password to be hashed

  const verificationToken = await TokenVerification.create({
    // generates  verification token linked to the user
    userId: newUser._id,
  });
  await sendVerificationMail(newUser.email, verificationToken.token); // this is the to and token in sendVerificationMail in service.
};

export const authenticateUser = async (email, password) => {
  const user = await User.findOne({ email }).select("+password"); // checks if it finds a user with that email
  if (!user) throw new BusinessLogicError("Invalid credentials", 401); // If not, throws a global error that is picked up in next()
  if (!checkPassword(password, user.password))
    throw new BusinessLogicError("Invalid credentials", 401); // global error handler

  if (user.isBanned) throw new BusinessLogicError("Account is banned", 403); // global error handler
  if (!user.isVerified)
    throw new BusinessLogicError("Please verify your email before login", 400); // checking if user is verified
  return user; // returns the authenticated user to controller
};

export const verifyEmailService = async (code) => {
  if (!code) throw new BusinessLogicError("Verification code is required", 400);
  const token = await TokenVerification.findOne({ token: code }); // finds the token in db
  if (!token) return;

  await User.findByIdAndUpdate(token.userId, { isVerified: true }); // marking the user as verified
  await token.deleteOne(); // delete the used or expired token
};

export const resetPasswordRequest = async (email) => {
  if (!email) throw new BusinessLogicError("email is required", 400);
  const user = await User.findOne({ email }); // finding the user with their email
  if (!user) return; // don't reveal that the user don't exists in case of unwanted request
  await ResetPassword.deleteMany({ userId: user._id }); // delete any existing reset tokens

  const resetToken = await ResetPassword.create({
    userId: user._id,
  });

  await sendPasswordResetMail(user.email, resetToken.token); // sends the email with reset link
};

export const resetPassword = async (code, newPassword) => {
  if (!code || !newPassword) throw new BusinessLogicError("code and password are required", 400);
  
  const resetToken = await ResetPassword.findOne({ token: code }); // search up for the reset password token
  if (!resetToken)
    throw new BusinessLogicError("Invalid or expired token", 400); // error if we dont find the reset token

  const user = await User.findById(resetToken.userId); // Find the user that the reset token is connected to
  if (!user) throw new BusinessLogicError("User was not found", 404); // error if not found user

  user.password = newPassword; // users password is now the new password
  await user.save(); // saves the changes to the user
  await resetToken.deleteOne(); // deletes the reset token after it has been used.
};

export const createAccessTokenService = async (refreshToken, requestIp) => {
  if (!refreshToken)
    throw new BusinessLogicError("No refresh token provided", 401); // cookie expired or never logged in

  const session = await Session.findOne({ refreshToken }); // looking up the session from db.
  if (!session) throw new BusinessLogicError("Invalid refresh token", 401); // session expired, revoked or never existed

  if (session.ip !== "unknown" && session.ip !== normalizeIp(requestIp)) {
    // If the ip that makes the request is different from the session ip
    await session.deleteOne(); // deletes the session if the request is from another ip
    throw new BusinessLogicError("Session invalidated due to IP change", 401);
  }

  const user = await User.findById(session.userId); // get the user linked to this session
  if (!user) throw new BusinessLogicError("User not found", 404); // did not find the user

  const accessToken = getAccessToken(user, requestIp); // generate a new short lived access token

  return { accessToken, user };
};

export const logoutUserService = async (refreshToken) => {
  if (!refreshToken)
    throw new BusinessLogicError("No refresh token provided", 401);

  const session = await Session.findOneAndDelete({ refreshToken });
  if (!session) throw new BusinessLogicError("Session not found", 401);
};
