import mongoose from "mongoose";
import {
  DEFAULT_USER_ELO_RATING,
  DEFAULT_USER_POINTS,
  DEFAULT_USER_BOARD_COLOR,
  DEFAULT_USER_LOBBY_SIZE,
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_USER_AGE,
  MAX_USER_AGE,
  MIN_USER_ELO_RATING,
  MIN_USER_POINTS,
  MAX_USER_EMAIL_LENGTH,
  MAX_USER_BIO_LENGTH,
  ALLOWED_USERNAME_FORMAT,
  ALLOWED_USER_EMAIL_FORMAT,
} from "../config/constants.js";
import { hashPassword } from "../utils/password-hash.js";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: [true, "Username is required. [schema]"],
      unique: true,
      minLength: [MIN_USERNAME_LENGTH, `Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters. [schema]`],
      maxLength: [MAX_USERNAME_LENGTH, `Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters. [schema]`],
      match: [ALLOWED_USERNAME_FORMAT, "Username can only contain letters and numbers. [schema]"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required. [schema]"],
      unique: true,
      lowercase: true,
      maxLength: [MAX_USER_EMAIL_LENGTH, `Email cannot be longer than ${MAX_USER_EMAIL_LENGTH} characters. [schema]`],
      match: [ALLOWED_USER_EMAIL_FORMAT, "Must be a valid email address, e.g. user@mail.com. [schema]"],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password is required. [schema]"],
      select: false, // So we don't accidentally expose our password
      minLength: [MIN_PASSWORD_LENGTH, `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters. [schema]`],
      maxLength: [MAX_PASSWORD_LENGTH, `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters. [schema]`],
    },
    age: {
      type: Number,
      required: [true, "Age is required. [schema]"],
      min: [MIN_USER_AGE, `Age must be between ${MIN_USER_AGE} and ${MAX_USER_AGE}. [schema]`],
      max: [MAX_USER_AGE, `Age must be between ${MIN_USER_AGE} and ${MAX_USER_AGE}. [schema]`],
    },
    role: {
      type: String,
      default: "user",
      enum: { values: ["user", "admin"], message: "Role must be either user or admin. [schema]" },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    eloRating: {
      type: Number,
      default: DEFAULT_USER_ELO_RATING,
      min: [MIN_USER_ELO_RATING, `Elo rating cannot be lower than ${MIN_USER_ELO_RATING}. [schema]`],
    },
    points: {
      type: Number,
      default: DEFAULT_USER_POINTS, // Weekly allowance for betting
      min: [MIN_USER_POINTS, `Points cannot be lower than ${MIN_USER_POINTS}. [schema]`],
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      trim: true,
      default: "",
      maxLength: [MAX_USER_BIO_LENGTH, `Bio cannot be longer than ${MAX_USER_BIO_LENGTH} characters. [schema]`],
    },
    profileImageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    appearance: {
      theme: { type: String, default: "dark", enum: { values: ["light", "dark"], message: "Theme must be either light or dark. [schema]" } },
      boardColor: { type: String, default: DEFAULT_USER_BOARD_COLOR },
      sound: { type: Boolean, default: true },
      lobbySize: { type: Number, default: DEFAULT_USER_LOBBY_SIZE },
    },
    trophies: [
      {
        title: { type: String, trim: true },
        imageUrl: { type: String, trim: true },
        wonAt: { type: Date },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password; // so its not outputted in a api call by mistake
        return ret;
      },
    },
  },
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await hashPassword(this.password);
  }
});

const User = mongoose.model("User", userSchema, "users");

export default User;
