import User from "../models/User.js";
import { chechPassword, hashPassword } from "../utils/password-hash.js";
import { Session } from "../models/Session.js";
import { BusinessLogicError } from "../utils/errors.js";
import { ResetPassword } from "../models/passwordReset.js";
import { sendPasswordResetMail } from "./email-service.js";

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
    roles: userData.role || "user",
  });
  if (!newUser)
    throw new BusinessLogicError("Could not create a new user", 400); // If somethings wrong with the input, we trow a global error, and its picked up in next()
  return await newUser.save(); // Saves to db. This triggers the password to be hashed
};

export const authenticateUser = async (email, password) => {
  const user = await User.findOne({ email }).select("+password"); // checks if it finds a user with that email
  if (!user) throw new BusinessLogicError("Invalid credentials", 401); // If not, throws a global error that is picked up in next()
  if (!chechPassword(password, user.password))
    throw new BusinessLogicError("Invalid credentials", 401); // global error handler

  if (user.isBanned) throw new BusinessLogicError("Account is banned", 403); // global error handler
  if (!user.isVerified)
    throw new BusinessLogicError("Please verify your email before login"); // checking if user is verified
  return user; // returns the authenticated user to controller
};

export const resetPasswordRequest = async (email) => {
  const user = await User.findOne({ email }); // finding the user with their email
  if (!user) return; // don't reveal that the user don't exists in case of unwanted request

  await ResetPassword.deleteMany({ userId: user._id }); // delete any existing reset tokens

  const resetToken = await ResetPassword.create({
    userId: user._id,
  });

  await sendPasswordResetMail(user.email, resetToken.token); // sends the email with reset link
};

export const resetPassword = async (code, newPassword) => {
  const resetToken = await ResetPassword.findOne({ token: code }); // search up for the reset password token
  if (!resetToken)
    throw new BusinessLogicError("Invalid or expired token", 400); // error if we dont find the reset token

  const user = await User.findById(resetToken.userId); // Find the user that the reset token is connected to
  if (!user) throw new BusinessLogicError("User was not found", 404); // error if not found user


  user.password = newPassword; // users password is now the new password
  await user.save(); // saves the changes to the user
  await resetToken.deleteOne(); // deletes the reset token after it has been used. 
};
