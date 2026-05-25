import express from "express";
import { getLeaderboardData } from "../controllers/leaderboard-controller.js";

const leaderboardRouter = express.Router();

leaderboardRouter.get("/", getLeaderboardData);

export default leaderboardRouter;
