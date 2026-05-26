import User from "../models/User.js";
import Match from "../models/Match.js";
import { chechPassword } from "../utils/password-hash.js";
import { BusinessLogicError } from "../utils/errors.js";


// Get a paginated, filtered list of all users
export async function getAllUsers(filters) {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (filters.search !== undefined) {
    filter.$or = [
      { username: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
    ];
  }

  const users = await User.find(filter).skip(skip).limit(limit);
  const total = await User.countDocuments(filter);

  return { page, limit, total, results: users };
}


// Get a single user by ID along with their ten most recent completed matches
export async function getUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new BusinessLogicError("User not found", 404);
  }

  const recentMatches = await Match.find({
    "players.userId": user._id,
    status: "completed",
  })
    .populate("players.userId", "username")
    .populate("winnerId", "username")
    .sort({ updatedAt: -1 })
    .limit(10);

  return { user, recentMatches };
}


// Update a user's profile fields, handling password change with old password verification
export async function updateUser(userId, updateData) {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new BusinessLogicError("User not found", 404);
  }

  if (updateData.email !== undefined) {
    user.email = updateData.email;
  }
  if (updateData.bio !== undefined) {
    user.bio = updateData.bio;
  }
  if (updateData.profileImageUrl !== undefined) {
    user.profileImageUrl = updateData.profileImageUrl;
  }
  if (updateData.appearance !== undefined) {
    if (updateData.appearance.theme !== undefined) {
      user.appearance.theme = updateData.appearance.theme;
    }
    if (updateData.appearance.boardColor !== undefined) {
      user.appearance.boardColor = updateData.appearance.boardColor;
    }
    if (updateData.appearance.sound !== undefined) {
      user.appearance.sound = updateData.appearance.sound;
    }
    if (updateData.appearance.lobbySize !== undefined) {
      user.appearance.lobbySize = updateData.appearance.lobbySize;
    }
  }

  if (updateData.password !== undefined) {
    if (updateData.oldPassword === undefined) {
      throw new BusinessLogicError("Old password is required to change password", 400);
    }
    const passwordMatch = chechPassword(updateData.oldPassword, user.password);
    if (!passwordMatch) {
      throw new BusinessLogicError("Old password is incorrect", 401);
    }
    user.password = updateData.password;
  }

  const savedUser = await user.save();
  return savedUser;
}


// Set a user as banned so they can no longer join tournaments or matches
export async function banUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new BusinessLogicError("User not found", 404);
  }
  user.isBanned = true;
  const savedUser = await user.save();
  return savedUser;
}


// Give a user the admin role
export async function makeAdmin(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new BusinessLogicError("User not found", 404);
  }
  user.role = "admin";
  const savedUser = await user.save();
  return savedUser;
}
