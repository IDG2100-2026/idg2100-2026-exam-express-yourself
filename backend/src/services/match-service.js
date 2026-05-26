import Match from "../models/Match.js";
import User from "../models/User.js";
import { updateEloRating, updateEloMultiplayer } from "./elo-service.js";
import { BusinessLogicError } from "../utils/errors.js";


// Get a paginated, filtered list of matches for the lobby
export async function getAllMatches(filters) {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (filters.status !== undefined) {
    filter.status = filters.status;
  }
  if (filters.playerId !== undefined) {
    filter["players.userId"] = filters.playerId;
  }
  if (filters.rounds !== undefined) {
    filter["category.rounds"] = filters.rounds;
  }
  if (filters.timeControl !== undefined) {
    filter["category.timeControl"] = filters.timeControl;
  }
  if (filters.straightsAllowed !== undefined) {
    filter["category.straightsAllowed"] = filters.straightsAllowed;
  }

  const matches = await Match.find(filter)
    .populate("players.userId", "username eloRating profileImageUrl")
    .populate("winnerId", "username")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Match.countDocuments(filter);

  return { page, limit, total, results: matches };
}


// Get a single match by ID with player details filled in
export async function getMatch(matchId) {
  const match = await Match.findById(matchId)
    .populate("players.userId", "username eloRating profileImageUrl")
    .populate("winnerId", "username");

  if (!match) {
    throw new BusinessLogicError("Match not found", 404);
  }

  return match;
}


// Create a new match room and join the creator as the first player
export async function createMatch(userId, matchData) {
  const rounds = matchData.rounds;
  const timeControl = matchData.timeControl;
  const maxPlayers = matchData.maxPlayers;

  let buyIn = 1;
  if (matchData.buyIn !== undefined) {
    buyIn = matchData.buyIn;
  }

  let straightsAllowed = true;
  if (matchData.straightsAllowed !== undefined) {
    straightsAllowed = matchData.straightsAllowed;
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new BusinessLogicError("User not found", 404);
  }
  if (user.points < buyIn) {
    throw new BusinessLogicError("Not enough points for buy-in", 400);
  }

  // Subtract the buy-in before creating the match so the user can't create without paying
  user.points = user.points - buyIn;
  await user.save();

  // stack is how many points this player has put into the current match pot
  const newMatch = new Match({
    players: [{ userId: userId, stack: buyIn }],
    maxPlayers: maxPlayers,
    category: {
      rounds: rounds,
      straightsAllowed: straightsAllowed,
      timeControl: timeControl,
    },
    buyIn: buyIn,
    status: "waiting",
  });

  const savedMatch = await newMatch.save();
  return savedMatch;
}


// Add a player to an existing waiting match and start it automatically when full
export async function joinMatch(matchId, userId) {
  const match = await Match.findById(matchId);
  if (!match) {
    throw new BusinessLogicError("Match not found", 404);
  }

  if (match.status !== "waiting") {
    throw new BusinessLogicError("Match is not open to join", 400);
  }

  const alreadyInMatch = match.players.some(function (player) {
    return player.userId.toString() === userId;
  });
  if (alreadyInMatch) {
    throw new BusinessLogicError("You are already in this match", 400);
  }

  if (match.players.length >= match.maxPlayers) {
    throw new BusinessLogicError("Match is full", 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new BusinessLogicError("User not found", 404);
  }
  if (user.points < match.buyIn) {
    throw new BusinessLogicError("Not enough points for buy-in", 400);
  }

  // Deduct the buy-in before adding the player to the match
  user.points = user.points - match.buyIn;
  await user.save();

  match.players.push({ userId: userId, stack: match.buyIn });

  // Start the match automatically once all player slots are filled
  if (match.players.length >= match.maxPlayers) {
    match.status = "in-progress";
    match.startedAt = new Date();
  }

  const savedMatch = await match.save();
  return savedMatch;
}


// Remove a player from a waiting match and refund their buy-in
export async function leaveMatch(matchId, userId) {
  const match = await Match.findById(matchId);
  if (!match) {
    throw new BusinessLogicError("Match not found", 404);
  }

  if (match.status !== "waiting") {
    throw new BusinessLogicError(
      "Cannot leave a match that has already started",
      400,
    );
  }

  const user = await User.findById(userId);
  if (user) {
    user.points = user.points + match.buyIn;
    await user.save();
  }

  match.players = match.players.filter(function (player) {
    return player.userId.toString() !== userId;
  });

  // Delete the match entirely if the last player leaves
  if (match.players.length === 0) {
    await match.deleteOne();
    return { deleted: true };
  }

  const savedMatch = await match.save();
  return { deleted: false, match: savedMatch };
}


// Record the match result, award the full pot to the winner, and update ELO ratings for all players
export async function recordResult(matchId, winnerId, score) {
  const match = await Match.findById(matchId);
  if (!match) {
    throw new BusinessLogicError("Match not found", 404);
  }

  if (match.status === "completed") {
    throw new BusinessLogicError(
      "Result has already been recorded for this match",
      400,
    );
  }

  if (match.status !== "in-progress") {
    throw new BusinessLogicError("Match is not in progress", 400);
  }

  const winnerIsAPlayer = match.players.some(function (player) {
    return player.userId.toString() === winnerId;
  });
  if (!winnerIsAPlayer) {
    throw new BusinessLogicError(
      "Winner must be one of the players in this match",
      400,
    );
  }

  match.winnerId = winnerId;
  match.score = score;
  match.status = "completed";
  match.endedAt = new Date();
  await match.save();

  // The pot is the buy-in multiplied by the number of players, all goes to the winner
  const totalPot = match.buyIn * match.players.length;
  if (totalPot > 0) {
    const winner = await User.findById(winnerId);
    if (winner) {
      winner.points = winner.points + totalPot;
      await winner.save();
    }
  }

  // ELO update works differently for 2-player vs multiplayer matches
  if (match.players.length === 2) {
    // 2-player: one clear winner and one loser
    const loserPlayer = match.players.find(function (player) {
      return player.userId.toString() !== winnerId;
    });
    if (loserPlayer) {
      await updateEloRating(winnerId, loserPlayer.userId.toString(), false);
    }
  } else {
    // Multiplayer: winner gets finalPoints 1, everyone else 0, used for ranked ELO calculation
    const playerResults = match.players.map(function (player) {
      let finalPoints = 0;
      if (player.userId.toString() === winnerId) {
        finalPoints = 1;
      }
      return {
        userId: player.userId.toString(),
        finalPoints: finalPoints,
      };
    });
    await updateEloMultiplayer(playerResults);
  }

  return match;
}
