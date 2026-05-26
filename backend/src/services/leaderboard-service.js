import Match from "../models/Match.js";
import User from "../models/User.js";


// Get a ranked list of players, either by ELO rating or by match win stats with optional filters
export async function getLeaderboard(filters) {
  const rounds = filters.rounds;
  const timeControl = filters.timeControl;
  const straightsAllowed = filters.straightsAllowed;
  const sortBy = filters.sortBy;

  // Simple ELO-based leaderboard if no filters
  if (!rounds && !timeControl && !straightsAllowed && !sortBy) {
    const users = await User.find({ isBanned: false })
      .select("username eloRating profileImageUrl")
      .sort({ "eloRating.tc30": -1 })
      .limit(20);
    return users;
  }

  // Build match filter
  const matchFilter = { status: "completed" };
  if (rounds) matchFilter["category.rounds"] = Number(rounds);
  if (timeControl) matchFilter["category.timeControl"] = Number(timeControl);
  if (straightsAllowed !== undefined) {
    matchFilter["category.straightsAllowed"] = straightsAllowed === "true";
  }

  // Aggregation pipeline to compute stats per player
  const validSortFields = ["wins", "winPercentage", "matches"];
  let sortField = "wins";
  if (validSortFields.includes(sortBy)) {
    sortField = sortBy;
  }

  const pipeline = [
    { $match: matchFilter },
    { $unwind: "$players" },
    { $match: { "players.userId": { $ne: null } } },
    {
      $group: {
        _id: "$players.userId",
        matches: { $sum: 1 },
        wins: {
          $sum: {
            $cond: [{ $eq: ["$winnerId", "$players.userId"] }, 1, 0],
          },
        },
      },
    },
    {
      $addFields: {
        winPercentage: {
          $round: [{ $multiply: [{ $divide: ["$wins", "$matches"] }, 100] }, 0],
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $match: { "user.isBanned": false } },
    {
      $project: {
        _id: 0,
        username: "$user.username",
        eloRating: "$user.eloRating",
        profileImageUrl: "$user.profileImageUrl",
        wins: 1,
        matches: 1,
        winPercentage: 1,
      },
    },
    { $sort: { [sortField]: -1 } },
    { $limit: 20 },
  ];

  return Match.aggregate(pipeline);
}
