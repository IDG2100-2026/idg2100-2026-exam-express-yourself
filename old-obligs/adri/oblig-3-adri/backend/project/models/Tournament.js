import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        maxlength: 200,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    matches: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Match"
        }
    ],
    trophy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trophy"
    },
    straightsAllowed: {
        type: Boolean,
        required: true
    },
    bestOf: {
        type: Number,
        enum: [3, 5, 7],
        required: true,
    },
    timeControl: {
        type: Number,
        enum: [5, 10, 15],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

const Tournament = mongoose.model("Tournament", tournamentSchema, "tournaments");

export default Tournament;