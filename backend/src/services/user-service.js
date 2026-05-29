import User from "../models/User.js";
import Match from "../models/Match.js";
import { checkPassword } from "../utils/password-hash.js";
import { BusinessLogicError } from "../utils/errors.js";
import { MSEC_PER_DAY } from "../config/constants.js";

// checking if the username is available or not
export const checkIfUsernameIsAvailable = async (username) => {
  const exists = await User.findOne({ username });
  if (exists)
    throw new BusinessLogicError(
      "Username is already taken! Try a new one",
      403,
    );
};

// check if this email already is a registered user
export const checkIfEmailExists = async (email) => {
  const exists = await User.findOne({ email });
  if (exists)
    throw new BusinessLogicError(
      "Email already exist! Login, or register with a new one",
      403,
    );
};

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

// Get a single user by ID with stats and paginated recent matches, hiding email from other users
export async function getUser(userId, requestingUserId, filters = {}) {
  const user = await User.findById(userId);
  if (!user) {
    throw new BusinessLogicError("User not found", 404);
  }

  // Convert to plain object so we can remove fields before sending
  const userObj = user.toObject();

  // Count all completed matches this user has played
  const totalGames = await Match.countDocuments({
    "players.userId": user._id,
    status: "completed",
  });

  // Count wins and losses in the last 30 days
  const lastMonth = new Date(Date.now() - 30 * MSEC_PER_DAY);

  const winsLastMonth = await Match.countDocuments({
    winnerId: user._id,
    status: "completed",
    endedAt: { $gte: lastMonth },
  });

  const totalLastMonth = await Match.countDocuments({
    "players.userId": user._id,
    status: "completed",
    endedAt: { $gte: lastMonth },
  });

  const lossesLastMonth = totalLastMonth - winsLastMonth;

  // Paginated recent matches
  const matchPage = filters.matchPage || 1;
  const matchLimit = filters.matchLimit || 10;
  const skip = (matchPage - 1) * matchLimit;

  const recentMatches = await Match.find({
    "players.userId": user._id,
    status: "completed",
  })
    .populate("players.userId", "username")
    .populate("winnerId", "username")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(matchLimit);

  // Remove email if the requester is neither the owner nor an admin
  if (requestingUserId !== userId) {
    let requestingUser = null;
    if (requestingUserId) {
      requestingUser = await User.findById(requestingUserId);
    }
    if (!requestingUser || requestingUser.role !== "admin") {
      delete userObj.email;
    }
  }

  return {
    user: userObj,
    stats: {
      totalGames,
      winsLastMonth,
      lossesLastMonth,
    },
    recentMatches: {
      page: matchPage,
      limit: matchLimit,
      total: totalGames,
      results: recentMatches,
    },
  };
}

// Update a user's profile fields, handling password change with old password verification
export async function updateUser(userId, updateData, requestingUserId) {
  // Only the owner or an admin can update a profile
  if (requestingUserId !== userId) {
    const requestingUser = await User.findById(requestingUserId);
    if (!requestingUser || requestingUser.role !== "admin") {
      throw new BusinessLogicError("You can only update your own profile", 403);
    }
  }

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
      throw new BusinessLogicError(
        "Old password is required to change password",
        400,
      );
    }
    const passwordMatch = checkPassword(updateData.oldPassword, user.password);
    if (!passwordMatch) {
      throw new BusinessLogicError("Old password is incorrect", 400);
    }
    user.password = updateData.password;
  }

  const savedUser = await user.save();
  return savedUser;
}

// Set a new profile image URL on a user, enforcing ownership (only owner or admin can change it)
export async function uploadAvatar(userId, profileImageUrl, requestingUserId) {
  if (requestingUserId !== userId) {
    const requestingUser = await User.findById(requestingUserId);
    if (!requestingUser || requestingUser.role !== "admin") {
      throw new BusinessLogicError("You can only update your own profile", 403);
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { profileImageUrl },
    { new: true },
  );
  if (!user) {
    throw new BusinessLogicError("User not found", 404);
  }
  return user;
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
