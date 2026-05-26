import mongoose from "mongoose";
import {
  VALID_PLAYER_COUNTS,
  VALID_ROUNDS,
  VALID_TIME_CONTROLS,
  VALID_BUY_INS,
  MATCH_STATUSES,
} from "../config/constants.js";

const matchSchema = new mongoose.Schema(
  {
    players: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: [true, "Player user ID is required. [schema]"],
          ref: "User",
        },
        stack: {
          type: Number,
          default: 0, // Points this player has in the game
        },
      },
    ],
    maxPlayers: {
      type: Number,
      default: 2,
      enum: {
        values: VALID_PLAYER_COUNTS,
        message: `Max players must be one of: ${VALID_PLAYER_COUNTS.join(", ")}. [schema]`,
      },
    },
    category: {
      rounds: {
        type: Number,
        required: [true, "Rounds is required. [schema]"],
        enum: {
          values: VALID_ROUNDS,
          message: `Rounds must be one of: ${VALID_ROUNDS.join(", ")}. [schema]`,
        },
      },
      straightsAllowed: { type: Boolean, default: true },
      timeControl: {
        type: Number,
        required: [true, "Time control is required. [schema]"],
        enum: {
          values: VALID_TIME_CONTROLS,
          message: `Time control must be one of: ${VALID_TIME_CONTROLS.join(", ")}. [schema]`,
        },
      }, // seconds total
    },
    buyIn: {
      type: Number,
      default: 1,
      enum: {
        values: VALID_BUY_INS,
        message: `Buy-in must be one of: ${VALID_BUY_INS.join(", ")}. [schema]`,
      },
    },
    score: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      default: "waiting",
      enum: {
        values: MATCH_STATUSES,
        message: `Status must be one of: ${MATCH_STATUSES.join(", ")}. [schema]`,
      },
    },
    // Tournament link
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      default: null,
    },
    round: {
      type: Number,
      default: null, // Which tournament round
    },
    startedAt: { type: Date },
    endedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

const Match = mongoose.model("Match", matchSchema, "matches");

export default Match;
