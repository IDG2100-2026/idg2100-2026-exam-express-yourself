import mongoose from "mongoose";
import { randomUUID } from "crypto";
import { VERIFICATION_TOKEN_TTL } from "../config/auth-config.js";
const resetPasswordSchema = new mongoose.Schema({
  token: {
    type: String,
    unique: true,
    required: true,
    default: () => randomUUID(),
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  expireAt: {
    type: Date,
    default: Date.now,
    expires: VERIFICATION_TOKEN_TTL,
  },
});

export const ResetPassword = mongoose.model(
  "resetPasswordSchema",
  resetPasswordSchema,
);
