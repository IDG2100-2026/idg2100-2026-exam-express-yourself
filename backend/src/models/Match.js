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
        dice: {
          type: [Number],
          default: [0, 0, 0, 0, 0], // signals that no dices are rolled yet
        },
        held: { // if a user are holding dices
          type: [Boolean],
          default: [false, false, false, false, false],
        },
        rollsUsed: { // how many times a user have rolled
          type: Number,
          default: 0,
        },
        hasFolded: { // if a user is still in the game or not
          type: Boolean,
          default: false,
        },
        currentBet: { // what the current bet is to be matched
          type: Number,
          default: 0,
        },
        hasMatchedBet: { // if the user has matched the highest bet
          type: Boolean,
          default: false,
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
    currentRound: { // tracks which round we are on
      type: Number,
      default: 0
    },
    currentPlayerIndex: { // tracks which players turn it is
      type: Number,
      default: 0
    },
    phase: { // tells if we are rolling, betting or showing dice's
      type: String,
      enum: ["rolling", "betting", "reveal"],
      default: "rolling"
    },
    pot: { // total points bet by all the players
      type: Number,
      default: 0
    },
    highestBet: { // current amount of point all players need to match for moving forward
      type: Number,
      default: 0
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
  },
);

const Match = mongoose.model("Match", matchSchema);

export default Match;
