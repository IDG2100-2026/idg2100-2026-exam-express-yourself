import * as trophyServices from "../services/trophy-services.js";

export async function createTrophy(req, res) { //create new trophy db, requires admin role
    try {
        const role = req.role;
        if (role !== "admin") {
            res.status(403);
            res.json({ error: "FORBIDDEN_ACCESS", message: "Restricted access" });
            return;
        }
        const trophyData = req.body;
        const newTrophy = await trophyServices.createTrophy(trophyData);
        res.status(201);
        res.json({ message: "Trophy created successfully", _id: newTrophy._id });
    } catch (error) {
        res.status(500);
        res.json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
    }
}

export async function getTrophy(req, res) { //return one trophy by id
    try {
        const id = req.params.id;
        const trophy = await trophyServices.getTrophy(id);
        res.status(200);
        res.json(trophy);
    } catch (error) {
        if (error.message === "NOT_FOUND") {
            res.status(404);
            res.json({ error: "NOT_FOUND", message: "Trophy not found" });
        } else {
            res.status(500);
            res.json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
        }
    }
}

export default {
    createTrophy,
    getTrophy
};
