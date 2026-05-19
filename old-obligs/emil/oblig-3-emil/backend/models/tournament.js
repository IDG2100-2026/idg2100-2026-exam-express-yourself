import mongoose from "mongoose";
import {
  MIN_TOURNAMENT_TITLE_LENGTH,
  MAX_TOURNAMENT_TITLE_LENGTH,
  MIN_TOURNAMENT_DESCRIPTION_LENGTH,
  MAX_TOURNAMENT_DESCRIPTION_LENGTH,
} from "../config/constants.js";

const tournamentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      minLength: [
        MIN_TOURNAMENT_TITLE_LENGTH,
        `Title needs to be at least ${MIN_TOURNAMENT_TITLE_LENGTH}`,
      ],
      maxLength: [
        MAX_TOURNAMENT_TITLE_LENGTH,
        `Title can not have more characters than ${MAX_TOURNAMENT_TITLE_LENGTH}`,
      ],
    },
    description: {
      type: String,
      trim: true,
      required: true,
      minLength: [
        MIN_TOURNAMENT_DESCRIPTION_LENGTH,
        `Description needs at least ${MIN_TOURNAMENT_DESCRIPTION_LENGTH} characters!`,
      ],
      maxLength: [
        MAX_TOURNAMENT_DESCRIPTION_LENGTH,
        `Description cannot have more than ${MAX_TOURNAMENT_DESCRIPTION_LENGTH} characters!`,
      ],
    },
    format: {
      rounds: {
        type: Number,
        enum: [3, 5, 7],
        required: true,
      },
      straight: {
        type: Boolean,
        default: false,
      },
      timeControl: {
        type: Number,
        enum: [3, 10, 30],
        required: true,
      },
      breakDuration: {
        // time between matches
        type: Number,
        enum: [10, 20, 30],
        required: true,
      },
    },
    startTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      trim: true,
      enum: ["Upcoming", "Ongoing", "Finished"],
      default: "Upcoming",
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Null until we crown a tournament winner
    },
    trophy: {
      title: {
        type: String,
        trim: true,
        required: true,
      },
      tournamentTrophy: {
        type: String,
        trim: true,
      },
    },
    bracket: [
      {
        round: {
          type: Number,
          required: true,
        },
        matches: [
          {
            gameId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Game",
              default: null, // Null until the game is created!
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
              default: null, // Null until round winner!
            },
          },
        ],
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, pojo) => {
        delete pojo._id;
        return pojo;
      },
    },
  },
);

export const Tournament = mongoose.model("Tournament", tournamentSchema);
