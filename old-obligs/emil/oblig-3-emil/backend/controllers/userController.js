import userServices from "../services/userServices.js";
import { matchedData, param } from "express-validator";
import { User } from "../models/user.js";

// Gets all users with pagination
export async function getAllUsers(req, res) {
  const page = parseInt(req.query.page) || 1; // If page not specified, 1 is default
  const limit = parseInt(req.query.limit) || 10; // If limit not specified, 10 is default

  const allUsersList = await userServices.getAllUsers(page, limit); // Gets all users from DB from services.

  if (allUsersList) {
    return res.status(200).json(allUsersList);
  }
  return res.status(404).json({ Message: "Could not find any users!" }); // 404 if user is not found.
}

// Gets one user from its mongoDB object id.
export async function getAUser(req, res) {
  const id = req.params.id;
  const userObject = await userServices.getOneUser(id);
  if (userObject) {
    return res.status(200).json({ ...userObject });
  }
  return res
    .status(404)
    .json({ message: `Could not find user with id: ${id}` }); // 404 if user does not exist.
}

export async function createUser(req, res) {
  try {
    const data = matchedData(req);
    const newUser = await userServices.createUser(data);
    if (newUser) {
      return res.status(201).json({ Message: "User created:", newUser });
    }
    return res.status(400).json({ msg: "You sent a bad input! Please try again" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { pwd, email, age } = req.body;

    const user = await User.findOne({ _id: id });

    if (!user) {
      return res.status(404).json({ Message: "User was not found!" });
    }

    if (email) user.email = email;
    if (pwd) user.pwd = pwd;
    if (age) user.age = age;

    // This triggers the pre("save") we have in schema validation, so the new password (if new password) gets hashed!
    await user.save();

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ Error: err.message });
  }
}

export async function banUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findOne({ _id: id });

    if (!user) {
      return res.status(404).json({ Error: "User was not found!" });
    }

    user.isBanned
      ? res.status(400).json({ message: `${user.username} is already banned!` })
      : (user.isBanned = true); // If user is already banned, we send a 400, but if user is not banned, we set isBanned to true that bans the player. Only admin can ban!

    // saves, so the banned player is banned in mongoDBs
    await user.save();

    res.status(200).json({ message: `${user.username} has been banned!` });
  } catch (err) {
    res.status(500).json({ Error: err.message });
  }
}

export default {
  getAllUsers,
  getAUser,
  createUser,
  updateUser,
  banUser,
};
