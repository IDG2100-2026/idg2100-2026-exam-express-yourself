import express from 'express';
const leaderboardRouter = express.Router();
const { getLeaderboard, getActivity } = require('../controllers/leaderboardController');

leaderboardRouter.get('/', getLeaderboard);       // this will return top 20 players, supports category filters and sortBy
leaderboardRouter.get('/activity', getActivity);  // this will return ongoing match count and last 10 completed matches

export default leaderboardRouter;
;