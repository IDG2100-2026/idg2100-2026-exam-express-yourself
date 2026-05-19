const express = require('express');
const router = express.Router();
const { getLeaderboard, getActivity } = require('../controllers/leaderboardController');

router.get('/', getLeaderboard);       // this will return top 20 players, supports category filters and sortBy
router.get('/activity', getActivity);  // this will return ongoing match count and last 10 completed matches

module.exports = router;
