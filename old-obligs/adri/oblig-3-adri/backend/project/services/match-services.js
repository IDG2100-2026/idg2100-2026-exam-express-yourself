import Match from "../models/Match.js";

export async function createMatch(matchData) {
    const newMatch = new Match(matchData);
    return newMatch.save();
}

export async function getMatch(id) { //find one match by id
    const match = await Match.findById(id)
        .populate("playerOne", "username elo") //fetch username and elo instead of just user id
        .populate("playerTwo", "username elo");
    if (!match) {
        throw new Error("NOT_FOUND");
    }
    return match;
}

export async function getMatches() { //fetch all matches from db
    return Match.find()
        .populate("playerOne", "username elo") //fetch username and elo instead of just user id
        .populate("playerTwo", "username elo");
}

export async function updateMatch(id, newData) { //find match by id and update with new data
    const match = await Match.findById(id);
    if (!match) {
        throw new Error("NOT_FOUND");
    }
    if (newData.playerTwo) {
        match.playerTwo = newData.playerTwo; //set second player when someone joins
    }
    if (newData.status) {
        match.status = newData.status;
    }
    if (newData.winner) {
        match.winner = newData.winner;
    }
    if (newData.isDraw !== undefined) {
        match.isDraw = newData.isDraw;
    }
    if (newData.status === "finished") {
        match.matchDate = new Date(); //automatically set match date when match finish
    }
    return match.save();
}

export async function deleteMatch(id) { //delete match from db by id
    const match = await Match.findById(id);
    if (!match) {
        throw new Error("NOT_FOUND");
    }
    return match.deleteOne();
}