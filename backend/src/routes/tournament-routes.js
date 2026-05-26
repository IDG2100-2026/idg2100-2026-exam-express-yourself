import express from "express";
import {
  validateGetTournaments,
  validateCreateTournament,
  validateUpdateTournament,
  validateReportMatchResult,
} from "../validators/tournament-validator.js";
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
tournamentRouter.get("/", validateGetTournaments(), validate, getAllTournaments);
tournamentRouter.get("/:id", getTournament);
tournamentRouter.get("/:id/standings", getStandings);


tournamentRouter.use(authenticate);


// Authenticated users
tournamentRouter.post("/:id/join", authorize("user"), joinTournament);
tournamentRouter.post("/:id/leave", authorize("user"), leaveTournament);


// Admin only
tournamentRouter.post("/", authorize("admin"), upload.single("trophyImage"), validateCreateTournament(), validate, createTournament);
tournamentRouter.put("/:id", authorize("admin"), validateUpdateTournament(), validate, updateTournament);
tournamentRouter.post("/:id/start", authorize("admin"), startTournament);
tournamentRouter.post("/:id/cancel", authorize("admin"), cancelTournament);
tournamentRouter.put("/:id/matches/:matchId/result", authorize("admin"), validateReportMatchResult(), validate, reportMatchResult);
tournamentRouter.delete("/:id", authorize("admin"), deleteTournament);


export default tournamentRouter;
