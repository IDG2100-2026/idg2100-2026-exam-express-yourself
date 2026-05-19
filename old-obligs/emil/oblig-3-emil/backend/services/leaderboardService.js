import { Game } from "../models/game.js";
import { eloRating } from "./eloService.js";

function getLeaderboardPipeline(filters) {
  const { rounds, timeControl, straightAllowed, sortBy } = filters;
  const gameFilter = { status: "Finished", isAnonymous: false };
  if (rounds) gameFilter["variant.rounds"] = Number(rounds);
  if (timeControl) gameFilter["variant.timeControl"] = Number(timeControl);
  if (straightAllowed !== undefined) {
    gameFilter["variant.straightAllowed"] = straightAllowed === "true";
  }

  const validFields = ["wins", "winPercentage", "numberOfMatches"];
  const sortFields = validFields.includes(sortBy) ? sortBy : "wins";

  return [
    { $match: gameFilter },
    { $unwind: "$players" },
    {
      $group: {
        _id: "$players.userId",
        numberOfMatches: { $sum: 1 },
        wins: {
          $sum: {
            $cond: [{ $eq: ["$outcome.winner", "$players.userId"] }, 1, 0],
          },
        },
      },
    },
    {
      $addFields: {
        winPercentage: {
          $round: [
            { $multiply: [{ $divide: ["$wins", "$numberOfMatches"] }, 100] },
            0,
          ],
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

    {
      $project: {
        _id: 0,
        username: "$user.username",
        eloRating: "$user.eloRating",
        wins: 1,
        numberOfMatches: 1,
        winPercentage: 1,
        trophies: { $size: "$user.trophies" },
      },
    },

    { $sort: { [sortFields]: -1 } },
  ];
}

export async function getLeaderboards(filters) {
  const pipeline = getLeaderboardPipeline(filters);
  return await Game.aggregate(pipeline);
}
