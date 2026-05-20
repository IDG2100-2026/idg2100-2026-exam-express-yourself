const User = require('../models/User');
const Match = require('../models/Match');
const bcrypt = require('bcryptjs');

// GET /api/users, admin only
// supports ?search= to filter by username or email
const getAllUsers = async (req, res, next) => {
  try {
    // this will read page and limit from the url query, with defaults if not provided
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit; // this will calculate how many documents to skip

    // this will build a search filter if a search term was given
    const filter = {};
    if (req.query.search) {
      // this will match the search term against username or email, case insensitive
      filter.$or = [
        { username: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // this will fetch the users for this page and remove the password field from results
    const users = await User.find(filter)
      .skip(skip)
      .limit(limit);

    res.json({ page, limit, results: users });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
const getUser = async (req, res, next) => {
  try {
    // this will find a user by their id and leave out the password
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // this will fetch the 10 most recent completed matches this user played in
    const recentMatches = await Match.find({
      $or: [{ player1: user._id }, { player2: user._id }],
      status: 'completed',
    })
      .populate('player1 player2 winnerId', 'username')
      .sort({ updatedAt: -1 })
      .limit(10);

    // this will send back the user data together with their recent matches
    res.json({ ...user.toObject(), recentMatches });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/register
const registerUser = async (req, res, next) => {
  try {
    // this will pull the fields we need from the request body
    const { username, email, password, age } = req.body;

    // this will hash the password before saving, 10 salt rounds is a good balance of speed and security
    // we never store plain text passwords
    const hashedPassword = await bcrypt.hash(password, 10);

    // this will create and save the new user in the database
    const user = await User.create({ username, email, password: hashedPassword, age });
    res.status(201).json({ message: 'User created', userId: user._id });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // this will look up the user by email first
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    // this will compare what they typed with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    // this will block banned users from logging in
    if (user.isBanned) return res.status(403).json({ error: 'Account is banned' });

    // this will send back the user id and role so the client knows who is logged in
    res.json({ message: 'Login successful', userId: user._id, role: user.role });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id, logged in users only
const updateUser = async (req, res, next) => {
  try {
    const { email, bio, profileImageUrl, password, appearance } = req.body;

    // this will build the update object with only the fields that were sent
    const updates = {};
    if (email !== undefined) updates.email = email;
    if (bio !== undefined) updates.bio = bio;
    if (profileImageUrl !== undefined) updates.profileImageUrl = profileImageUrl;
    if (appearance !== undefined) updates.appearance = appearance;

    // this will hash the new password before saving if one was provided
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// POST /api/users/:id/ban, admin only
const banUser = async (req, res, next) => {
  try {
    // this will set isBanned to true, the user will be blocked from logging in
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User banned' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUser, registerUser, loginUser, updateUser, banUser };
