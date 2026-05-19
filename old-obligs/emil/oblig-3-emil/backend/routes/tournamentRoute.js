import {
  validateTournamentCreation,
  validateUpdateTournament,
} from "../validators/tournamentValidator.js";
import tournamentController from "../controllers/tournamentController.js";
import { adminRequired, userRequire } from "../middleware/user.auth.js";
import { validate } from "../validators/validate.js";
import express from "express";
import upload from "../middleware/uploadWithMulter.js";
import commentController from "../controllers/commentController.js";
import { commentRateLimiter } from "../middleware/commentRateLimiter.js";
const tournamentRoute = express.Router();

tournamentRoute.get("/tournaments", tournamentController.getTournaments); // Gets all tournaments

tournamentRoute.get(
  "/tournaments/:id",
  validate,
  tournamentController.getOneTournament,
); // Gets one tournament by its ids

tournamentRoute.post(
  "/tournaments",
  adminRequired,
  validateTournamentCreation(),
  validate,
  tournamentController.createTournament,
); // Creates a tournament. Admin only

tournamentRoute.put(
  "/tournaments/:id/trophy",
  adminRequired,
  upload.single("trophyImage"),
  tournamentController.uploadTrophy,
); // Trophy image upload!

tournamentRoute.put(
  "/tournaments/:id",
  adminRequired,
  validateUpdateTournament(),
  validate,
  tournamentController.updateTournament,
); // Updates a tournament

tournamentRoute.post(
  "/tournaments/:id/join",
  userRequire,
  tournamentController.enrollUserIntoTournament,
); // Joins a tournament pool

tournamentRoute.post(
  "/tournaments/:id/start",
  adminRequired,
  tournamentController.startTournament,
);

tournamentRoute.put(
  "/tournaments/:id/matches/:matchId/result",
  adminRequired,
  tournamentController.matchResult,
);

tournamentRoute.delete(
  // Deletes a tournament, Only admin can do that
  "/tournaments/:id",
  adminRequired,
  tournamentController.deleteTournament,
);

tournamentRoute.get(
  "/tournaments/:id/standings",
  tournamentController.getTournamentStandings,
); // Gets tournament standings

tournamentRoute.post(
  "/tournaments/:id/comments",
  userRequire,
  commentRateLimiter,
  validate,
  commentController.addTournamentComment,
); // Posts a comment on a tournament.

export default tournamentRoute;
