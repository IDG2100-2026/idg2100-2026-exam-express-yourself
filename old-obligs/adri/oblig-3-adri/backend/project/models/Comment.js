import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        maxlength: 200,
        required: true
    },
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Match"
    },
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament"
    }
}, { timestamps: true });

const Comment = mongoose.model("Comment", commentSchema, "comments");

export default Comment;
