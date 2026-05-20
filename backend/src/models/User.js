import mongoose from "mongoose";
import {
  MAX_USER_USERNAME_LENGTH,
  MIN_USER_USERNAME_LENGTH,
  MIN_USER_PASSWORD_LENGTH,
  MIN_USER_AGE_LENGTH,
  MAX_USER_AGE_LENGTH,
  DEFAULT_USER_ELO_RATING,
  MAX_USER_BIO_LENGTH
} from "../config/constants.js";

// this defines what a user looks like in the database
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // this will make sure no two users have the same username
      trim: true, // this will remove any extra spaces around the value
      minLength: [
        MIN_USER_USERNAME_LENGTH,
        `Username must be al least ${MIN_USER_USERNAME_LENGTH} characters long`,
      ],
      maxlength: [
        MAX_USER_USERNAME_LENGTH,
        `Username cannot be longer than ${MAX_USER_USERNAME_LENGTH} characters long`,
      ],
      match: [/^[a-zA-Z0-9]+$/, "Username can contain characters and numbers"],
    },
    email: {
      type: String,
      required: true,
      unique: true, // this will make sure no two users have the same email
      trim: true,
      lowercase: true,
      match: [/^.+@[a-z]+\.[a-z]+$/, "{VALUE} isn't an email."],
    },
    // this will store the password as a bcrypt hash, never as plain text
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: [
        MIN_USER_PASSWORD_LENGTH,
        `Password must be longer than ${MIN_USER_PASSWORD_LENGTH} characters long`,
      ],
      maxLength: [
        MAX_USER_PASSWORD_LENGTH,
        `Password cannot be longer than ${MAX_USER_PASSWORD_LENGTH} characters long`,
      ],
    },
    age: {
      type: Number,
      required: true,
      min: [
        MIN_USER_AGE_LENGTH,
        `You must be at least ${MIN_USER_AGE_LENGTH} years old to play this game!`,
      ], // this will reject anyone under 18 at the database level
      max: [
        MAX_USER_AGE_LENGTH,
        `You can not be older than ${MAX_USER_AGE_LENGTH} years old to play on this platform`,
      ],
    },
    // this will control what the user is allowed to do on the platform
    role: {
      type: String,
      enum: ["user", "admin"], // this will only allow these two values
      default: "user",
    },
    // this will start at 1000 and go up or down after each match
    eloRating: {
      type: Number,
      default: DEFAULT_USER_ELO_RATING,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    // this will store the user's appearance preferences so they sync across devices
    appearance: {
      theme: { type: String, default: "dark" },
      boardColor: { type: String, default: "#1c2130" },
      sound: { type: Boolean, default: true },
      lobbySize: { type: Number, default: 5 },
    },

    // this will store a short description the user writes about themselves
    bio: {
      type: String,
      default: "",
      maxlength: MAX_USER_BIO_LENGTH,
    },

    // this will store the url of the user's uploaded profile image
    profileImageUrl: {
      type: String,
      default: "",
    },

    // this will store all trophies the user has won from tournaments
    trophies: [
      {
        title: String,
        imageUrl: String,
        wonAt: Date,
      },
    ],
    // this will automatically add createdAt and updatedAt fields to every document
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
