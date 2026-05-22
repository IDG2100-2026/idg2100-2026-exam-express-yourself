import express from "express";
import { getLeaderboardData } from "../controllers/leaderboardController.js";

const leaderboardRouter = express.Router();

leaderboardRouter.get("/", getLeaderboardData);

export default leaderboardRouter;
