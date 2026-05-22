import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 64,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    rules: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    startDate: {
      type: Date,
      required: true,
    },
    numberOfRounds: {
      type: Number,
      default: 3,
    },
    category: {
      rounds: { type: Number, enum: [3, 5, 7] },
      straightsAllowed: { type: Boolean, default: true },
      timeControl: { type: Number, enum: [10, 30, 90] },
    },
    buyIn: {
      type: Number,
      default: 0,
    },
    eloRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 9999 },
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["upcoming", "cancelled", "in-progress", "completed"],
      default: "upcoming",
    },
    trophy: {
      title: { type: String, trim: true },
      imageUrl: { type: String, trim: true },
    },
    // Bracket for round-based random pairing (from Emil)
    bracket: [
      {
        round: { type: Number, required: true },
        matches: [
          {
            gameId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Match",
              default: null,
            },
            players: [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
              },
            ],
            winner: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              default: null,
            },
          },
        ],
      },
    ],
    currentRound: {
      type: Number,
      default: 0,
    },
    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Tournament = mongoose.model("Tournament", tournamentSchema);

export default Tournament;
