import * as tournamentServices from "../services/tournament-services.js";

export async function createTournament(req, res) { //create new tournament in db, requires admin role
    try {
        const role = req.role;
        if (role !== "admin") {
            res.status(403);
            res.json({ error: "FORBIDDEN_ACCESS", message: "Restricted access" });
            return;
        }
        const tournamentData = req.body;
        const newTournament = await tournamentServices.createTournament(tournamentData);
        res.status(201);
        res.json({ message: "Tournament created successfully", _id: newTournament._id });
    } catch (error) {
        res.status(500);
        res.json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
    }
}

export async function joinTournament(req, res) { //add user to tournament participant pool
    try {
        const role = req.role;
        if (role === "anonymous") {
            res.status(403);
            res.json({ error: "FORBIDDEN_ACCESS", message: "Restricted access" });
            return;
        }
        const id = req.params.id;
        const userId = req.body.userId;
        await tournamentServices.joinTournament(id, userId);
        res.status(200);
        res.json({ message: "Joined tournament successfully" });
    } catch (error) {
        if (error.message === "NOT_FOUND") {
            res.status(404);
            res.json({ error: "NOT_FOUND", message: "Tournament not found" });
        } else if (error.message === "CONFLICT") {
            res.status(409);
            res.json({ error: "CONFLICT", message: "User already in tournament" });
        } else {
            res.status(500);
            res.json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
        }
    }
}

export async function getTournaments(req, res) { //fetch list of all tournaments
    try {
        const tournaments = await tournamentServices.getTournaments();
        res.status(200);
        res.json(tournaments);
    } catch (error) {
        res.status(500);
        res.json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
    }
}

export async function getTournament(req, res) { //return one tournament by id
    try {
        const id = req.params.id;
        const tournament = await tournamentServices.getTournament(id);
        res.status(200);
        res.json(tournament);
    } catch (error) {
        if (error.message === "NOT_FOUND") {
            res.status(404);
            res.json({ error: "NOT_FOUND", message: "Tournament not found" });
        } else {
            res.status(500);
            res.json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
        }
    }
}

export async function deleteTournament(req, res) { //delete one tournament by id, requires admin
    try {
        const role = req.role;
        if (role !== "admin") {
            res.status(403);
            res.json({ error: "FORBIDDEN_ACCESS", message: "Restricted access" });
            return;
        }
        const id = req.params.id;
        await tournamentServices.deleteTournament(id);
        res.status(200);
        res.json({ message: "Tournament deleted successfully" });
    } catch (error) {
        if (error.message === "NOT_FOUND") {
            res.status(404);
            res.json({ error: "NOT_FOUND", message: "Tournament not found" });
        } else {
            res.status(500);
            res.json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
        }
    }
}

export default {
    createTournament,
    joinTournament,
    getTournaments,
    getTournament,
    deleteTournament
};
