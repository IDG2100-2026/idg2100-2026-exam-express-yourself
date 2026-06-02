import { getLeaderboard as getLeaderboardService } from "../services/leaderboard-service.js";


// Get the leaderboard, optionally filtered by game variant (GET /api/leaderboard?rounds=&timeControl=&straightsAllowed=&sortBy=)
export async function getLeaderboardData(req, res, next) {
  const data = await getLeaderboardService(req.validated);
  res.status(200);
  res.json(data);
}
