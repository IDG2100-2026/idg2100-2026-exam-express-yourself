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
tournamentRouter.get("/", validateGetTournaments(), validate, getAllTournaments); // get all tournaments
tournamentRouter.get("/:id", getTournament); // get a single tournament
tournamentRouter.get("/:id/standings", getStandings); // get bracket standings


tournamentRouter.use(authenticate);


// Authenticated users
tournamentRouter.post("/:id/join", authorize("user"), joinTournament); // join a tournament
tournamentRouter.post("/:id/leave", authorize("user"), leaveTournament); // leave a tournament


// Admin only
tournamentRouter.post("/", authorize("admin"), upload.single("trophyImage"), validateCreateTournament(), validate, createTournament); // create a tournament
tournamentRouter.put("/:id", authorize("admin"), validateUpdateTournament(), validate, updateTournament); // update a tournament
tournamentRouter.post("/:id/start", authorize("admin"), startTournament); // start a tournament
tournamentRouter.post("/:id/cancel", authorize("admin"), cancelTournament); // cancel a tournament
tournamentRouter.put("/:id/matches/:matchId/result", authorize("admin"), validateReportMatchResult(), validate, reportMatchResult); // record a bracket match result
tournamentRouter.delete("/:id", authorize("admin"), deleteTournament); // delete a tournament


export default tournamentRouter;
