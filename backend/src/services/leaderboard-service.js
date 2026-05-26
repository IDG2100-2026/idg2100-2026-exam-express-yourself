import Match from "../models/Match.js";
import User from "../models/User.js";
import { LEADERBOARD_SORT_OPTIONS } from "../config/constants.js";


// Get the top 20 players ranked by ELO or win stats, with optional game variant filters
export async function getLeaderboard(filters) {
  const rounds = filters.rounds;
  const timeControl = filters.timeControl;
  const straightsAllowed = filters.straightsAllowed;
  const sortBy = filters.sortBy;

  // No filters given, just rank everyone by their 30-second ELO rating
  if (!rounds && !timeControl && !straightsAllowed && !sortBy) {
    const users = await User.find({ isBanned: false })
      .select("username eloRating profileImageUrl")
      .sort({ "eloRating.tc30": -1 })
      .limit(20);
    return users;
  }

  // Narrow down which completed matches to count based on the filters
  const matchFilter = { status: "completed" };
  if (rounds) {
    matchFilter["category.rounds"] = rounds;
  }
  if (timeControl) {
    matchFilter["category.timeControl"] = timeControl;
  }
  if (straightsAllowed !== undefined) {
    matchFilter["category.straightsAllowed"] = straightsAllowed;
  }

  // Pick which stat to rank by, defaulting to wins
  let sortField = "wins";
  if (LEADERBOARD_SORT_OPTIONS.includes(sortBy)) {
    sortField = sortBy;
  }

  const pipeline = [
    { $match: matchFilter },
    { $unwind: "$players" },
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
