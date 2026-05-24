import mongoose from "mongoose";
import { randomUUID } from "crypto";
import { VERIFICATION_TOKEN_TTL } from "../config/auth.config.js";
const tokenVerification = new Schema({
  token: {
    type: "UUID",
    unique: true,
    required: true,
    default: () => randomUUID(),
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: VERIFICATION_TOKEN_TTL,
  },
});

export const TokenVerification = mongoose.model(
  "tokenVerification",
  tokenVerification,
);
