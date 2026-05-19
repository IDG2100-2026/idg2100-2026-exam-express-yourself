import mongoose from "mongoose";

const trophySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament",
        required: true
    }
}, { timestamps: true });

const Trophy = mongoose.model("Trophy", trophySchema, "trophies");

export default Trophy;