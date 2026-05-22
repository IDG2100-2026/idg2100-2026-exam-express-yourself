import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { DEFAULT_ELO_RATING } from "../config/constants.js";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 1,
      maxlength: 64,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Never accidentally expose password
    },
    age: {
      type: Number,
      required: true,
      min: [18, "You must be at least 18 years old"],
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
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// Helper to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
