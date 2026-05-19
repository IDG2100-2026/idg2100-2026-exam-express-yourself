import express from "express";
import * as tournamentControllers from "../controllers/tournament-controllers.js";

const router = express.Router();

router.post("/", tournamentControllers.createTournament); //POST /tournaments create a new tournament
router.post("/:id/join", tournamentControllers.joinTournament); //POST /tournaments/:id/join add user to tournament participant pool
router.get("/", tournamentControllers.getTournaments); //GET /tournaments fetch list of all tournaments
router.get("/:id", tournamentControllers.getTournament); //GET /tournaments/:id fetch one tournament by id
router.delete("/:id", tournamentControllers.deleteTournament); //DELETE /tournaments/:id delete tournament by id

export default router;