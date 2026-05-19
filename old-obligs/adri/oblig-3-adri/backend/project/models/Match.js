import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
    playerOne: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    playerTwo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    straightsAllowed: {
        type: Boolean,
        required: true
    },
    bestOf: {
        type: Number,
        enum: [3, 5, 7],
        required: true
    },
    timeControl: {
        type: Number,
        enum: [3, 10, 30],
        required: true
    },
    status: {
        type: String,
        enum: ["waiting", "active", "finished"],
        default: "waiting" //new matches start waiting for second player
    },
    allowAnonymous: {
        type: Boolean,
        default: false //can allow anonymous isers to join
    },
    gameData: {
        //rolls and holds?
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    isDraw: {
        type: Boolean,
        default: false //could be removed idk, but one less thing to set when recording match results, most matches will not be draws
    },
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament"
    }, 
    matchDate: {
        type: Date
    }
}, { timestamps: true });

const Match = mongoose.model("Match", matchSchema, "matches");

export default Match;