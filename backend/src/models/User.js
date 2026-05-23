import mongoose from "mongoose";
import {
  DEFAULT_ELO_RATING,
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_USER_AGE,
  MAX_USER_AGE,
} from "../config/constants.js";
import { hashPassword } from "../utils/passwordHash.js";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: [
        MIN_USERNAME_LENGTH,
        `Username has to be at least ${MIN_USERNAME_LENGTH} characters long`,
      ],
      maxLength: [
        MAX_USERNAME_LENGTH,
        `Username cannot be longer than ${MAX_USERNAME_LENGTH} characters`,
      ],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^.+@[a-z]+\.[a-z]+$/, "{VALUE} isn't an email."],
    },
    password: {
      type: String,
      trim: true,
      required: true,
      select: false, // So we don't accidentally expose our password
      minLength: [
        MIN_PASSWORD_LENGTH,
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
      ],
      maxLength: [
        MAX_PASSWORD_LENGTH,
        `Password cannot be longer than  ${MAX_PASSWORD_LENGTH} characters`,
      ],
    },
    age: {
      type: Number,
      required: true,
      min: [
        MIN_USER_AGE,
        `You must be at least ${MIN_USER_AGE} years old to play this game!`,
      ],
      max: [
        MAX_USER_AGE,
        `You can not be older than ${MAX_USER_AGE} years old to play on this platform `,
      ],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    eloRating: {
      type: Number,
      default: DEFAULT_ELO_RATING,
    },
    points: {
      type: Number,
      default: 100, // Weekly allowance for betting
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 300,
    },
    profileImageUrl: {
      type: String,
      default: "",
    },
    appearance: {
      theme: { type: String, enum: ["light", "dark"], default: "dark" },
      boardColor: { type: String, default: "#1c2130" },
      sound: { type: Boolean, default: true },
      lobbySize: { type: Number, default: 5 },
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

const User = mongoose.model("User", userSchema);

export default User;
