import mongoose from "mongoose";
import {
  MIN_TOURNAMENT_TITLE_LENGTH,
  MAX_TOURNAMENT_TITLE_LENGTH,
  MIN_TOURNAMENT_DESCRIPTION_LENGTH,
  MAX_TOURNAMENT_DESCRIPTION_LENGTH,
  MAX_TOURNAMENT_RULES_LENGTH,
  DEFAULT_TOURNAMENT_NUMBER_OF_ROUNDS,
  DEFAULT_TOURNAMENT_BUY_IN,
  MIN_TOURNAMENT_BUY_IN,
  DEFAULT_TOURNAMENT_ELO_MIN,
  DEFAULT_TOURNAMENT_ELO_MAX,
  TOURNAMENT_STATUSES,
  VALID_ROUNDS,
  VALID_TIME_CONTROLS,
} from "../config/constants.js";

const tournamentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Title is required. [schema]"],
      minLength: [
        MIN_TOURNAMENT_TITLE_LENGTH,
        `Title must be between ${MIN_TOURNAMENT_TITLE_LENGTH} and ${MAX_TOURNAMENT_TITLE_LENGTH} characters. [schema]`,
      ],
      maxLength: [
        MAX_TOURNAMENT_TITLE_LENGTH,
        `Title must be between ${MIN_TOURNAMENT_TITLE_LENGTH} and ${MAX_TOURNAMENT_TITLE_LENGTH} characters. [schema]`,
      ],
    },
    description: {
      type: String,
      trim: true,
      minLength: [
        MIN_TOURNAMENT_DESCRIPTION_LENGTH,
        `Description must be between ${MIN_TOURNAMENT_DESCRIPTION_LENGTH} and ${MAX_TOURNAMENT_DESCRIPTION_LENGTH} characters. [schema]`,
      ],
      maxLength: [
        MAX_TOURNAMENT_DESCRIPTION_LENGTH,
        `Description must be between ${MIN_TOURNAMENT_DESCRIPTION_LENGTH} and ${MAX_TOURNAMENT_DESCRIPTION_LENGTH} characters. [schema]`,
      ],
    },
    rules: {
      type: String,
      trim: true,
      maxLength: [
        MAX_TOURNAMENT_RULES_LENGTH,
        `Rules cannot be longer than ${MAX_TOURNAMENT_RULES_LENGTH} characters. [schema]`,
      ],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Creator is required. [schema]"],
      ref: "User",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required. [schema]"],
    },
    numberOfRounds: {
      type: Number,
      default: DEFAULT_TOURNAMENT_NUMBER_OF_ROUNDS,
    },
    category: {
      rounds: {
        type: Number,
        enum: {
          values: VALID_ROUNDS,
          message: `Rounds must be one of: ${VALID_ROUNDS.join(", ")}. [schema]`,
        },
      },
      straightsAllowed: { type: Boolean, default: true },
      timeControl: {
        type: Number,
        enum: {
          values: VALID_TIME_CONTROLS,
          message: `Time control must be one of: ${VALID_TIME_CONTROLS.join(", ")}. [schema]`,
        },
      },
    },
    buyIn: {
      type: Number,
      default: DEFAULT_TOURNAMENT_BUY_IN,
      min: [
        MIN_TOURNAMENT_BUY_IN,
        `Buy-in cannot be lower than ${MIN_TOURNAMENT_BUY_IN}. [schema]`,
      ],
    },
    eloRange: {
      min: { type: Number, default: DEFAULT_TOURNAMENT_ELO_MIN },
      max: { type: Number, default: DEFAULT_TOURNAMENT_ELO_MAX },
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      default: "upcoming",
      enum: {
        values: TOURNAMENT_STATUSES,
        message: `Status must be one of: ${TOURNAMENT_STATUSES.join(", ")}. [schema]`,
      },
    },
    trophy: {
      title: { type: String, trim: true },
      imageUrl: { type: String, trim: true },
    },
    bracket: [
      {
        round: {
          type: Number,
          required: [true, "Round number is required. [schema]"],
        },
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
  },
);

const Tournament = mongoose.model(
  "Tournament",
  tournamentSchema,
  "tournaments",
);

export default Tournament;
