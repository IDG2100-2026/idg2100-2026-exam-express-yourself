import User from "../models/User.js";
import Match from "../models/Match.js";
import bcrypt from "bcryptjs";
import { matchedData } from "express-validator";
import { hashPassword, chechPassword } from "../utils/password-hash.js";
import { BusinessLogicError } from "../utils/errors.js";
// GET /api/users — admin only, supports ?search=
export async function getAllUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { username: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const users = await User.find(filter).skip(skip).limit(limit);
    const total = await User.countDocuments(filter);

    res.json({ page, limit, total, results: users });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/:id
export async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Fetch 10 most recent completed matches for this user
    const recentMatches = await Match.find({
      "players.userId": user._id,
      status: "completed",
    })
      .populate("players.userId", "username")
      .populate("winnerId", "username")
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({ ...user.toObject(), recentMatches });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/users/:id
export async function updateUser(req, res, next) {
  try {
    const { email, bio, profileImageUrl, password, oldPassword, appearance } =
      req.body;

    const updates = {};
    if (email !== undefined) updates.email = email;
    if (bio !== undefined) updates.bio = bio;
    if (profileImageUrl !== undefined)
      updates.profileImageUrl = profileImageUrl;
    if (appearance !== undefined) updates.appearance = appearance;

    // Hash new password if provided
    if (password) {
      const user = await User.findById(req.params.id).select("+password"); // User needs to confirm change with the old password
      if (!user) throw new BusinessLogicError("User not found", 404);

      if (!chechPassword(oldPassword, user.password)) {
        // checks if the old password is the same user typed
        throw new BusinessLogicError("Old password is incorrect", 401);
      }
      
      updates.password = hashPassword(password); // hashes the new password
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    next(err);
  }
}

// POST /api/users/:id/ban — admin only
export async function banUser(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true },
      { new: true },
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: `${user.username} has been banned` });
  } catch (err) {
    next(err);
  }
}

// POST /api/users/:id/make-admin — admin only
export async function makeAdmin(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "admin" },
      { new: true },
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: `${user.username} is now an admin` });
  } catch (err) {
    next(err);
  }
}
