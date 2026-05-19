import { User } from "../models/user.js";
import crypto from "crypto";

// checks if a username is taken or not
export async function checkIfUsernameExists(username) {
  const checkUsername = await User.findOne({ username });
  return !!checkUsername; // converts to boolean. Returns true if username exists, false otherwise
}

// checks if a email is taken or not
export async function checkIfEmailExists(email) {
  const checkEmail = await User.findOne({ email });
  return !!checkEmail; //converts to boolean.  Returns true if email exists, false otherwise
}

// gets all users from DB and sends to controller
export async function getAllUsers(page, limit) {
  return await User.find()
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  // return await User.find().lean();
}

// gets one user specified by id, and sends to controller
export async function getOneUser(id) {
  return await User.findOne({ _id: id }).lean();
}

//Creates a new user, and sends the object to controller
export async function createUser(userObject) {
  const user = {
    username: userObject.username,
    email: userObject.email,
    pwd: userObject.pwd,
    age: userObject.age,
  };

  const createdUser = await User.create(user);
  return createdUser;
}

export default {
  checkIfUsernameExists,
  checkIfEmailExists,
  getAllUsers,
  getOneUser,
  createUser,
};
