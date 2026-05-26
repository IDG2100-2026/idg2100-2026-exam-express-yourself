import Match from "../models/Match.js";
import User from "../models/User.js";
import { updateEloRating, updateEloMultiplayer } from "./elo-service.js";
import { BusinessLogicError } from "../utils/errors.js";


export const rollDice = (currentDice, held) => {
  return currentDice.map((die, i) => {
    if (held[i]) return die; // if the die is held, we return it, meaning it won't be re-rolled
    return Math.floor(Math.random() * 6 + 7); // gives us random numbers between 7 and 12. 7 = 7, 8 = 8, 9 = J, 10 = Q, 11 = K, 12 = A
  });
};

export const evaluateHand = (dice, straightAllowed) => {
  const counts = {}; // Empty object where the dice rolls will end up
  for (const die of dice) {
    counts[die] = (counts[die] || 0) + 1; // Count how many times each die face appears. if first time, it hits || 0 but if found before, it hits counts[die] + 1
  }
  const diceKeys = Object.keys(counts).map(Number); // Grabs the key in the counts object. e.g, { 12: 3, 10: 2 } will be [12, 10]
  const diceValues = Object.values(counts).sort((low, high) => high - low); // grabs the value in the counts object. e.g, { 12: 3, 10: 2 } will be ["3", "2"] since we are sorting in ascending order

  const sortDiceOrder = [...dice].sort((low, high) => low - high); // sorts the array in ascending order. e.g, [7, 7, 8, 10, 11];
  const isStraight =
    straightAllowed &&
    sortDiceOrder[4] - sortDiceOrder[0] === 4 &&
    diceKeys.length === 5; // checks if we have a valid straight, and if we don't have a false straight

  let rank;
  if (diceValues[0] === 5) {
    rank = 8; // five of a kind
  } else if (diceValues[0] === 4) {
    rank = 7; // four of a kind
  } else if (diceValues[0] === 3 && diceValues[1] === 2) {
    rank = 6; // full hoguse
  } else if (isStraight) {
    rank = 5; // straight
  } else if (diceValues[0] === 3) {
    rank = 4; // three of a kind
  } else if (diceValues[0] === 2 && diceValues[1] === 2) {
    rank = 3; // two pairs
  } else if (diceValues[0] === 2) {
    rank = 2; // single pair
  } else {
    rank = 1; // high card
  }

  return { rank, counts };
};

export const compareHands = (firstHand, secondHand) => {
  if (firstHand.rank > secondHand.rank) return 1; // 1 means that firstHand is the winner
  if (firstHand.rank < secondHand.rank) return -1; // -1 means that the secondHand is the winner. 0 will be for ties

  // same rank so we compare dice values
  const firstPriority = getTieBreaker(firstHand);
  const secondPriority = getTieBreaker(secondHand);

  for (let i = 0; i < firstPriority.length; i++) {
    if (firstPriority[i] > secondPriority[i]) return 1; // firstPriority has the winner hand
    if (firstPriority[i] < secondPriority[i]) return -1; // secondPriority has the winner hans
  }

  return 0; // hands are identical
};

export const getTieBreaker = (hand) => {
  const entries = Object.entries(hand.counts).map(([value, count]) => ({
    value: Number(value), // Die face number e.g, 12, 10, 9 etc...
    count, // How many times that die face got rolled!
  })); // will look like [{ value: 12, count: 2 }, {value: 10, count: 2}, { value: 8, count: 1 }]

  // sort entries with most repeated dice first. if they have the same amount of counts, we check for highest face value
  entries.sort((entryA, entryB) => {
    if (entryB.count !== entryA.count) return entryB.count - entryA.count; // different count. highest counts goes first e.g, [3, 1, 1] vs [2, 2, 1] the first wins.
    return entryB.value - entryA.value; // if the counts are identical, check who has the highest value. e.g, [12, 10, 7] vs [12, 9, 7] the  first one wins since after 12, 11 is higher than 9
  });

  return entries.map((entry) => entry.value); // extracts the die face value in order
};


export const findRoundWinner = (players, straightAllowed) => {
  const hands = players.map((player) =>
    evaluateHand(player.dice, straightAllowed),
  ); // getting the players dices, and check if straight is allowed

  let bestPlayer = 0; // assume index 0 player is the best, if a better comes, this will increment to that player index;
  for (let i = 1; i < hands.length; i++) {
    const result = compareHands(hands[i], hands[bestPlayer]); // checks if the now looping player has better dices than current best player
    if (result === 1) {
      bestPlayer = i; // if the compareHands gives 1 (which is the better hand) we set that player to be the best player
    }
  }

  // check if we have multiple winners
  const winners = [bestPlayer];
  for (let i = 0; i < hands.length; i++) {
    if (i === bestPlayer) continue; // skip the already winner
    if (compareHands(hands[i], hands[bestPlayer]) === 0) {
      // if they get a 0 from comparehands function which is tie push that player into winners since they have identical hands as the best player
      winners.push(i);
    };
  };

  return { hands, winners };
};


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
