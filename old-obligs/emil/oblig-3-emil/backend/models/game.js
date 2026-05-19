import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    players: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null, // default anonymous user!
        },
      },
    ],
    variant: {
      rounds: {
        type: Number,
        enum: [3, 5, 7],
      },
      straightAllowed: {
        type: Boolean,
        default: true,
      },
      timeControl: {
        type: Number,
        enum: [3, 10, 30],
      },
    },
    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Finished"],
      default: "Upcoming",
    },
    eloRequirement: {
      min: {
        type: Number,
        default: 1000,
      },
      max: {
        type: Number,
        default: 4000,
      },
    },
    allowAnonymousPlayers: {
      type: Boolean,
      default: false,
    },
    rolls: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    holds: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    outcome: {
      winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // _id from MongoDB to see who won
        default: null, // Null when draw!
      },
      draw: {
        type: Boolean,
        default: false,
      },
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
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
        // delete pojo._id;
        return pojo;
      },
    },
  },
);

export const Game = mongoose.model("Game", gameSchema);
