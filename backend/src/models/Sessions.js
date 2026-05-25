import mongoose, { Schema } from "mongoose";
import { randomUUID } from "crypto";
import { REFRESH_TOKEN_TTL } from "../config/auth.config.js";
import { MAX_LENGTH_AGENT_STRING } from "../config/constants.js";


const sessionSchema = new Schema({
    refreshToken: {
        type: "UUID",
        unique: true,
        required: true,
        default: () => randomUUID()
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    ip: {
        type: String,
        default: "unknown"
    },
    agent: {
        type: String,
        trim: true,
        maxLength: MAX_LENGTH_AGENT_STRING,
        default: "unknown"
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + REFRESH_TOKEN_TTL),
        expires: 0
    }
},{
    toJSON: {
        transform: (doc, ret) => {
            delete ret.refreshToken;
            delete ret.userId;
            ret.lastLoggedIn = ret.expiresAt;
            delete ret.expiresAt;
            return ret;
        },
        versionKey: false
    }
});

export const Session = mongoose.model("Session", sessionSchema);
