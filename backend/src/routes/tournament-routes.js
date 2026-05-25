import express from "express";
import { validateCreateTournament, validateUpdateTournament } from "../validators/tournament-validator.js";
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
} from "../controllers/tournament-controller.js";
import { authenticate, authorize } from "../middlewares/auth-middleware.js";

const tournamentRouter = express.Router();

// Public routes
tournamentRouter.get("/", getAllTournaments);
tournamentRouter.get("/:id", getTournament);
tournamentRouter.get("/:id/standings", getStandings);


tournamentRouter.use(authenticate);

// Authenticated users
tournamentRouter.post("/:id/join", authorize("user"), joinTournament);
tournamentRouter.post("/:id/leave", authorize("user"), leaveTournament);


// Admin only
tournamentRouter.post("/", authorize("admin"), upload.single("trophyImage"), validateCreateTournament(), validate, createTournament); // create new
tournamentRouter.put("/:id", authorize("admin"), validateUpdateTournament(), validate, updateTournament); // update tournament
tournamentRouter.post("/:id/start", authorize("admin"), startTournament); // start tournament
tournamentRouter.post("/:id/cancel", authorize("admin"), cancelTournament); // cancel tournament
tournamentRouter.put("/:id/matches/:matchId/result", authorize("admin"), reportMatchResult); // get result on tournament
tournamentRouter.delete("/:id", authorize("admin"), deleteTournament); // delete tournament

export default tournamentRouter;
