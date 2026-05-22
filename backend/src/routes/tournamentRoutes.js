import express from "express";
import { requireUser, requireAdmin } from "../middlewares/authMiddleware.js";
import { validateCreateTournament, validateUpdateTournament } from "../validators/tournamentValidator.js";
import { validate } from "../validators/validate.js";
import upload from "../middlewares/upload.js";
import {
  getAllTournaments,
  getTournament,
  createTournament,
  joinTournament,
  leaveTournament,
  startTournament,
  reportMatchResult,
  getStandings,
  updateTournament,
  deleteTournament,
  cancelTournament,
} from "../controllers/tournamentController.js";

const tournamentRouter = express.Router();

tournamentRouter.get("/", getAllTournaments);
tournamentRouter.get("/:id", getTournament);
tournamentRouter.get("/:id/standings", getStandings);

tournamentRouter.post("/", requireAdmin, upload.single("trophyImage"), validateCreateTournament(), validate, createTournament);
tournamentRouter.put("/:id", requireAdmin, validateUpdateTournament(), validate, updateTournament);
tournamentRouter.delete("/:id", requireAdmin, deleteTournament);

tournamentRouter.post("/:id/join", requireUser, joinTournament);
tournamentRouter.post("/:id/leave", requireUser, leaveTournament);
tournamentRouter.post("/:id/start", requireAdmin, startTournament);
tournamentRouter.post("/:id/cancel", requireAdmin, cancelTournament);

tournamentRouter.put("/:id/matches/:matchId/result", requireAdmin, reportMatchResult);

export default tournamentRouter;
