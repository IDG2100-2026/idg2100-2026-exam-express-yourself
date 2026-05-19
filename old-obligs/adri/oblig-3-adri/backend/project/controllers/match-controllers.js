import * as matchServices from "../services/match-services.js";

export async function createMatch(req, res) { //create new match in the db
    try {
        const matchData = req.body;
        const newMatch = await matchServices.createMatch(matchData);
        res.status(201);
        res.json({ message: "Match created successfully", _id: newMatch._id })
    } catch (error) {
        res.status(500);
        res.json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
    }
}

export async function getMatches(req, res) { //fetch list of all matches
    try {
        const matches = await matchServices.getMatches();
        res.status(200);
        res.json(matches);
    } catch (error) {
        res.status(500);
        res.json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
    }
}

export async function getMatch(req, res) { //return one match by id
    try {
        const id = req.params.id;
        const match = await matchServices.getMatch(id);
        res.status(200);
        res.json(match);
    } catch (error) {
        if (error.message === "NOT_FOUND") {
            res.status(404);
            res.json({ error: "NOT_FOUND", message: "Match not found" });
        } else {
            res.status(500);
            res.json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
        }
    }
}

export async function updateMatch(req, res) { //update one match with results by id
    try {
        const id = req.params.id;
        const newData = req.body;
        await matchServices.updateMatch(id, newData);
        res.status(200);
        res.json({ message: "Match updated successfully" });
    } catch (error) {
        if (error.message === "NOT_FOUND") {
            res.status(404);
            res.json({ error: "NOT_FOUND", message: "Match not found" });
        } else {
            res.status(500);
            res.json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
        }
    }
}

export async function deleteMatch(req, res) { //delete one match by id, requires admin role
    try {
        const role = req.role;
        if (role !== "admin") {
            res.status(403);
            res.json({ error: "FORBIDDEN_ACCESS", message: "Restricted access" });
            return;
        }
        const id = req.params.id;
        await matchServices.deleteMatch(id);
        res.status(200);
        res.json({ message: "Match deleted successfully" });
    } catch (error) {
        if (error.message === "NOT_FOUND") {
            res.status(404);
            res.json({ error: "NOT_FOUND", message: "Match not found" });
        } else {
            res.status(500);
            res.json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
        }
    }
}

export default {
    createMatch,
    getMatches,
    getMatch,
    updateMatch,
    deleteMatch
};
