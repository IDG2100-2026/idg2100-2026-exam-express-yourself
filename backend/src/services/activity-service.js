import Match from "../models/Match.js";
import User from "../models/User.js";

// Platform activity for homepage and admin dashboard
export async function getPlatformActivity() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Currently ongoing matches
  const ongoingMatches = await Match.countDocuments({ status: "in-progress" });

  // Available games (waiting for players)
  const availableGames = await Match.countDocuments({ status: "waiting" });

  // Games played this week
  const gamesThisWeek = await Match.countDocuments({
    status: "completed",
    updatedAt: { $gte: oneWeekAgo },
  });

  // Active players this week (unique players who played)
  const activePlayersResult = await Match.aggregate([
    { $match: { updatedAt: { $gte: oneWeekAgo } } },
    { $unwind: "$players" },
    { $match: { "players.userId": { $ne: null } } },
    { $group: { _id: "$players.userId" } },
    { $count: "count" },
  ]);
  const activePlayers = activePlayersResult[0]?.count || 0;

  // New profiles this week (for admin dashboard)
  const newProfiles = await User.countDocuments({
    createdAt: { $gte: oneWeekAgo },
  });

  // 10 most recent finished games
  const recentGames = await Match.find({
    status: "completed",
    isAnonymous: false,
  })
    .populate("players.userId", "username")
    .populate("winnerId", "username")
    .sort({ endedAt: -1 })
    .limit(10)
    .lean();

  return {
    ongoingMatches,
    availableGames,
    gamesThisWeek,
    activePlayers,
    newProfiles,
    recentGames,
  };
}
