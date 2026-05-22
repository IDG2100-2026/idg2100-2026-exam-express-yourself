import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    players: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null, // null for anonymous players
        },
        stack: {
          type: Number,
          default: 0, // Points this player has in the game
        },
      },
    ],
    maxPlayers: {
      type: Number,
      enum: [2, 3, 5],
      default: 2,
    },
    category: {
      rounds: { type: Number, enum: [3, 5, 7] },
      straightsAllowed: { type: Boolean, default: true },
      timeControl: { type: Number, enum: [10, 30, 90] }, // seconds total
    },
    buyIn: {
      type: Number,
      enum: [1, 10, 50],
      default: 1,
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
      enum: ["waiting", "in-progress", "completed"],
      default: "waiting",
    },
    isAnonymous: {
      type: Boolean,
      default: false,
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
  }
);

const Match = mongoose.model("Match", matchSchema);

export default Match;
