import User from "../models/User.js";
import { chechPassword, hashPassword } from "../utils/passwordHash.js";
import { Session } from "../models/Sessions.js";
import { BusinessLogicError } from "../utils/errors.js";

export const createSession = async (user, ip, agent) => {
  const session = await new Session({ // creates a new session and storing user's id, ip and agent. 
    userId: user._id,
    ip: user.ip,
    agent: user.agent
  });
  await session.save(); // Saves the new session to db
  return session.refreshToken; // return sessions refresh token
}

export const registerUser = async (userData) => {
  const newUser = await new User({ // creates a new User document 
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
  return user; // returns the authenticated user to controller
};
