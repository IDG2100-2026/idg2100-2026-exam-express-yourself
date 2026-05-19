import mongoose from "mongoose";
import { hashPwd } from "../utils/pwdHash.js";
import {
  MIN_USER_USERNAME_LENGTH,
  MAX_USER_USERNAME_LENGTH,
  MIN_USER_PWD_LENGTH,
  MAX_USER_PWD_LENGTH,
  MIN_USER_AGE_LENGTH,
  DEFAULT_USER_ELO_RATING,
  MAX_USER_AGE_LENGTH,
} from "../config/constants.js";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      unique: true, // Makes sure that we cant have two usernames that are alike.
      minLength: MIN_USER_USERNAME_LENGTH,
      maxLength: MAX_USER_USERNAME_LENGTH,
      match: [/^[a-zA-Z0-9]+$/, "Username can contain characters and numbers"], // example: emilllarsen99
    },
    pwd: {
      type: String,
      trim: true,
      required: true,
      select: false, // So we don't accidentally expose our password
      minLength: [
        MIN_USER_PWD_LENGTH,
        `Password must be at least ${MIN_USER_PWD_LENGTH} characters long`,
      ],
      maxLength: [
        MAX_USER_PWD_LENGTH,
        `Password cannot be longer than  ${MAX_USER_PWD_LENGTH} characters`,
      ],
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true, // Makes sure that we don't have duplicate emails.
      lowercase: true,
      match: [/^.+@[a-z]+\.[a-z]+$/, "{VALUE} isn't an email."],
    },
    age: {
      type: Number,
      required: true,
      min: [
        MIN_USER_AGE_LENGTH,
        `You must be at least ${MIN_USER_AGE_LENGTH} years old to play this game!`,
      ],
      max: [
        MAX_USER_AGE_LENGTH,
        `You can not be older than ${MAX_USER_AGE_LENGTH} years old to play on this platform `,
      ],
    },
    eloRating: {
      type: Number,
      default: DEFAULT_USER_ELO_RATING,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    trophies: [
      {
        title: {
          type: String,
          trim: true,
        },
        tournamentTrophy: {
          type: String,
          trim: true,
        },
      },
    ],
    recentGames: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      transform: (doc, pojo) => {
        // delete pojo._id; // deletes the mongo db id so the user cant see it
        delete pojo.pwd; // Deletes the password so the user cant see it. This does not delete the password in the database!
        return pojo;
      },
    },
  },
);

userSchema.pre("save", function () {
  // password is hashed on every database save!
  if (this.isModified("pwd")) {
    this.pwd = hashPwd(this.pwd);
  }
});

export const User = mongoose.model("User", userSchema);
