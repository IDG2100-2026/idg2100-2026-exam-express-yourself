const mongoose = require('mongoose');

// this defines what a user looks like in the database
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,  // this will make sure no two users have the same username
    trim: true,    // this will remove any extra spaces around the value
  },
  email: {
    type: String,
    required: true,
    unique: true,  // this will make sure no two users have the same email
  },
  // this will store the password as a bcrypt hash, never as plain text
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
    min: 18, // this will reject anyone under 18 at the database level
  },
  // this will control what the user is allowed to do on the platform
  role: {
    type: String,
    enum: ['user', 'admin'], // this will only allow these two values
    default: 'user',
  },
  // this will start at 1000 and go up or down after each match
  eloRating: {
    type: Number,
    default: 1000,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  // this will store the user's appearance preferences so they sync across devices
  appearance: {
    theme:      { type: String, default: 'dark' },
    boardColor: { type: String, default: '#1c2130' },
    sound:      { type: Boolean, default: true },
    lobbySize:  { type: Number, default: 5 },
  },

  // this will store a short description the user writes about themselves
  bio: {
    type: String,
    default: '',
    maxlength: 300,
  },

  // this will store the url of the user's uploaded profile image
  profileImageUrl: {
    type: String,
    default: '',
  },

  // this will store all trophies the user has won from tournaments
  trophies: [
    {
      title: String,
      imageUrl: String,
      wonAt: Date,
    }
  ],
// this will automatically add createdAt and updatedAt fields to every document
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
