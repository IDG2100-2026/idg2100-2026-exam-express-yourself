import { Game } from "../models/game.js";

// Retrieves activity for the dashboard
// Returns data on ongoing games, recent activity, and recent matches
export async function getPlatformActivity() {
  // Calculate date from 7 days ago for filtering recent activity
  const getThisWeek = new Date();
  getThisWeek.setDate(getThisWeek.getDate() - 7);

  // Counts how many games are in "Ongoing" state
  const ongoingGames = await Game.countDocuments({ status: "Ongoing" });

  // Counts games that have been updated within the last 7 days
  const activeUsers = await Game.countDocuments({
    updatedAt: { $gte: getThisWeek },
  });

  // Get the 10 most recent finished games
  const lastTenGames = await Game.find({
    status: "Finished",
    isAnonymous: false,
  })
    .sort({ endedAt: -1 })
    .limit(10)
    .populate("players.userId", "username")
    .lean();

  return { ongoingGames, activeUsers, lastTenGames };
}
