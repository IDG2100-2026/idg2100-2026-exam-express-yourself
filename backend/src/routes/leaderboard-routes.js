import express from "express";
import { validateGetLeaderboard } from "../validators/leaderboard-validator.js";
import { validate } from "../validators/validate.js";
import { getLeaderboardData } from "../controllers/leaderboard-controller.js";

const leaderboardRouter = express.Router();


// Public routes
leaderboardRouter.get("/", validateGetLeaderboard(), validate, getLeaderboardData);


export default leaderboardRouter;
