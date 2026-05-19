import express from 'express';
import { getLeaderboard, getActivity } from '../controllers/leaderboardController.js';

const leaderboardRouter = express.Router();

leaderboardRouter.get('/', getLeaderboard);       // this will return top 20 players, supports category filters and sortBy
leaderboardRouter.get('/activity', getActivity);  // this will return ongoing match count and last 10 completed matches

export default leaderboardRouter;
