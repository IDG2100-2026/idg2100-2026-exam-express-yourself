import { getLeaderboard } from "../services/leaderboardService.js";

export async function getLeaderboardData(req, res, next) {
  try {
    const data = await getLeaderboard(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
