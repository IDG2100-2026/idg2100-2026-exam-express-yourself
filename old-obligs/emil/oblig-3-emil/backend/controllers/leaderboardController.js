import { getLeaderboards } from "../services/leaderboardService.js";

export async function getLeaderboard(req, res) {
  try {
    const leaderboard = await getLeaderboards(req.query);
    return res.status(200).json(leaderboard);
  } catch (err) {
    return res.status(500).json({ Error: err.message });
  }
}
