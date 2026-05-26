import Match from "../models/Match.js";
import User from "../models/User.js";
import { updateEloRating, updateEloMultiplayer } from "./elo-service.js";
import { BusinessLogicError } from "../utils/errors.js";

export async function getAllMatches(filters) { // fetches a paginated, filtered list of matches for the lobby
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


export async function getMatch(matchId) { // fetches a single match by ID
  const match = await Match.findById(matchId)
    .populate("players.userId", "username eloRating profileImageUrl")
    .populate("winnerId", "username");

  if (!match) {
    throw new BusinessLogicError("Match not found", 404);
  }

  return match;
}


export async function createMatch(userId, matchData) { // creates a new match room and joins the creator as the first player
  const rounds = matchData.rounds;
  const timeControl = matchData.timeControl;
  const maxPlayers = matchData.maxPlayers;

  // Resolve optional fields with their defaults
  let buyIn = 1;
  if (matchData.buyIn !== undefined) {
    buyIn = matchData.buyIn;
  }

  let straightsAllowed = true;
  if (matchData.straightsAllowed !== undefined) {
    straightsAllowed = matchData.straightsAllowed;
  }

  // Check the user exists and has enough points for the buy-in
  const user = await User.findById(userId);
  if (!user) {
    throw new BusinessLogicError("User not found", 404);
  }
  if (user.points < buyIn) {
    throw new BusinessLogicError("Not enough points for buy-in", 400);
  }

  // Deduct buy-in from the creator's points
  user.points = user.points - buyIn;
  await user.save();

  // Create the match with the creator as the first player
  const newMatch = new Match({
    players: [{ userId: userId, stack: buyIn }],
    maxPlayers: maxPlayers, // uses schema default of 2 if not provided
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


export async function joinMatch(matchId, userId) { // adds a player to an existing waiting match
  const match = await Match.findById(matchId);
  if (!match) {
    throw new BusinessLogicError("Match not found", 404);
  }

  if (match.status !== "waiting") {
    throw new BusinessLogicError("Match is not open to join", 400);
  }

  // Check the user is not already in this match
  const alreadyInMatch = match.players.some(function (player) {
    return player.userId.toString() === userId;
  });
  if (alreadyInMatch) {
    throw new BusinessLogicError("You are already in this match", 400);
  }

  // Check the match is not full
  if (match.players.length >= match.maxPlayers) {
    throw new BusinessLogicError("Match is full", 400);
  }

  // Check the user exists and has enough points for the buy-in
  const user = await User.findById(userId);
  if (!user) {
    throw new BusinessLogicError("User not found", 404);
  }
  if (user.points < match.buyIn) {
    throw new BusinessLogicError("Not enough points for buy-in", 400);
  }

  // Subtract buy-in from the joining player's points
  user.points = user.points - match.buyIn;
  await user.save();

  // Add the player to the match
  match.players.push({ userId: userId, stack: match.buyIn });

  // Start the match automatically when enough players have joined
  if (match.players.length >= match.maxPlayers) {
    match.status = "in-progress";
    match.startedAt = new Date();
  }

  const savedMatch = await match.save();
  return savedMatch;
}


export async function leaveMatch(matchId, userId) { // removes a player from a waiting match and refunds their buy-in
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

  // Refund the buy-in to the player who is leaving
  const user = await User.findById(userId);
  if (user) {
    user.points = user.points + match.buyIn;
    await user.save();
  }

  // Remove the player from the match
  match.players = match.players.filter(function (player) {
    return player.userId.toString() !== userId;
  });

  // If no players are left, delete the match entirely
  if (match.players.length === 0) {
    await match.deleteOne();
    return { deleted: true };
  }

  const savedMatch = await match.save();
  return { deleted: false, match: savedMatch };
}


export async function recordResult(matchId, winnerId, score) { // records the result of a completed match, awards the buy-in pot and updates ELO
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

  // Check the winner is actually one of the players in this match
  const winnerIsAPlayer = match.players.some(function (player) {
    return player.userId.toString() === winnerId;
  });
  if (!winnerIsAPlayer) {
    throw new BusinessLogicError(
      "Winner must be one of the players in this match",
      400,
    );
  }

  // Record the result on the match
  match.winnerId = winnerId;
  match.score = score;
  match.status = "completed";
  match.endedAt = new Date();
  await match.save();

  // Award the full buy-in pot to the winner
  const totalPot = match.buyIn * match.players.length;
  if (totalPot > 0) {
    const winner = await User.findById(winnerId);
    if (winner) {
      winner.points = winner.points + totalPot;
      await winner.save();
    }
  }

  // Update ELO ratings for all players
  if (match.players.length === 2) {
    // 2-player match: straightforward winner vs loser
    const loserPlayer = match.players.find(function (player) {
      return player.userId.toString() !== winnerId;
    });
    if (loserPlayer) {
      await updateEloRating(winnerId, loserPlayer.userId.toString(), false);
    }
  } else {
    // Multiplayer: winner gets finalPoints 1, everyone else gets 0 for ranking
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
