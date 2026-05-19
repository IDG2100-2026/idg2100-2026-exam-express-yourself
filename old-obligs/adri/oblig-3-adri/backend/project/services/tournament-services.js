import Tournament from "../models/Tournament.js";

export async function createTournament(tournamentData) { //save new tournament to the db
    const newTournament = new Tournament(tournamentData);
    return newTournament.save();
}

export async function getTournaments() { //fetch all tournaments from db
    return Tournament.find();
}

export async function getTournament(id) { //find one tournament by id
    const tournament = await Tournament.findById(id);
    if (!tournament) {
        throw new Error("NOT_FOUND");
    }
    return tournament;
}

export async function joinTournament(id, userId) { //add user to tournament participant pool
    const tournament = await Tournament.findById(id);
    if (!tournament) {
        throw new Error("NOT_FOUND");
    }
    if (tournament.participants.includes(userId)) { //check if user is already in the participants array
        throw new Error("CONFLICT"); //throw error if user already in tournament
    }
    tournament.participants.push(userId); //add user to participants array
    return tournament.save();
}

export async function deleteTournament(id) { //find tournament by id and delete from db
    const tournament = await Tournament.findById(id);
    if (!tournament) {
        throw new Error("NOT_FOUND");
    }
    return tournament.deleteOne();
}