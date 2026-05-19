import express from "express";
import { getLeaderboard } from "../controllers/leaderboardController.js";

const leaderboardRoute = express.Router();

leaderboardRoute.get("/leaderboard", getLeaderboard);

export default leaderboardRoute;
