import Tournament from "../models/Tournament.js";
import Match from "../models/Match.js";
import User from "../models/User.js";
import { BusinessLogicError } from "../utils/errors.js";
import { TOURNAMENT_WIN_POINTS, ELO_FIELD_BY_TIME_CONTROL } from "../config/constants.js";


// Get a paginated, filtered list of tournaments
export async function getAllTournaments(filters) {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (filters.status !== undefined) {
    filter.status = filters.status;
  }
  if (filters.search !== undefined) {
    filter.title = { $regex: filters.search, $options: "i" };
  }

  let sortObj = { startDate: -1 };
  if (filters.sort === "title") {
    sortObj = { title: 1 };
  }
  if (filters.sort === "date") {
    sortObj = { startDate: -1 };
  }
  // Sorting by participant count needs a special MongoDB aggregation query, so "players" falls back to date sort

  const tournaments = await Tournament.find(filter)
    .populate("createdBy", "username")
    .populate("participants", "username")
    .populate("winnerId", "username")
    .sort(sortObj)
    .skip(skip)
    .limit(limit);

  const total = await Tournament.countDocuments(filter);

  return { page, limit, total, results: tournaments };
}


// Get a single tournament by ID with all its related data filled in
export async function getTournament(tournamentId) {
  const tournament = await Tournament.findById(tournamentId)
    .populate("createdBy", "username")
    .populate("participants", "username eloRating profileImageUrl")
    .populate("winnerId", "username")
    .populate("bracket.matches.players", "username")
    .populate("bracket.matches.winner", "username");

  if (!tournament) {
    throw new BusinessLogicError("Tournament not found", 404);
  }

  return tournament;
}


// Create a new tournament and set up its trophy
export async function createTournament(userId, tournamentData, imageUrl) {
  const title = tournamentData.title;
  const description = tournamentData.description;
  const rules = tournamentData.rules;
  const startDate = tournamentData.startDate;
  const numberOfRounds = tournamentData.numberOfRounds;
  const buyIn = tournamentData.buyIn;
  const eloRange = tournamentData.eloRange;
  const category = tournamentData.category;
  const trophyTitle = tournamentData.trophyTitle;

  const tournamentObj = {
    title: title,
    startDate: startDate,
    createdBy: userId,
  };

  if (description !== undefined) {
    tournamentObj.description = description;
  }
  if (rules !== undefined) {
    tournamentObj.rules = rules;
  }
  if (numberOfRounds !== undefined) {
    tournamentObj.numberOfRounds = numberOfRounds;
  }
  if (buyIn !== undefined) {
    tournamentObj.buyIn = buyIn;
  }
  if (eloRange !== undefined) {
    tournamentObj.eloRange = eloRange;
  }
  if (category !== undefined) {
    tournamentObj.category = category;
  }

  // Use the provided trophy title if given, otherwise fall back to the tournament title
  let trophyTitleValue = title;
  if (trophyTitle !== undefined) {
    trophyTitleValue = trophyTitle;
  }

  const trophy = { title: trophyTitleValue };
  if (imageUrl !== null) {
    trophy.imageUrl = imageUrl;
  }
  tournamentObj.trophy = trophy;

  const newTournament = new Tournament(tournamentObj);
  const savedTournament = await newTournament.save();
  return savedTournament;
}


// Add a user to a tournament after checking all eligibility rules
export async function joinTournament(tournamentId, userId) {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new BusinessLogicError("Tournament not found", 404);
  }

  if (tournament.status !== "upcoming") {
    throw new BusinessLogicError("Can only join upcoming tournaments", 400);
  }

  const alreadyJoined = tournament.participants.some(function (participantId) {
    return participantId.toString() === userId;
  });
  if (alreadyJoined) {
    throw new BusinessLogicError("You have already joined this tournament", 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new BusinessLogicError("User not found", 404);
  }
  if (user.isBanned) {
    throw new BusinessLogicError("Banned users cannot join tournaments", 403);
  }

  // Use the ELO rating for this tournament's time control, fall back to tc30 if none is set
  let eloField = ELO_FIELD_BY_TIME_CONTROL[tournament.category.timeControl];
  if (eloField === undefined) {
    eloField = "tc30";
  }
  const userElo = user.eloRating[eloField];
  if (userElo < tournament.eloRange.min || userElo > tournament.eloRange.max) {
    throw new BusinessLogicError("Your ELO rating is not within the required range for this tournament", 400);
  }

  if (user.points < tournament.buyIn) {
    throw new BusinessLogicError("Not enough points for the tournament buy-in", 400);
  }

  tournament.participants.push(userId);
  const savedTournament = await tournament.save();
  return savedTournament;
}


// Remove a user from the tournament participant list
export async function leaveTournament(tournamentId, userId) {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new BusinessLogicError("Tournament not found", 404);
  }

  tournament.participants = tournament.participants.filter(function (participantId) {
    return participantId.toString() !== userId;
  });

  await tournament.save();
  return tournament;
}


// Shuffle participants, create round 1 match documents, and set the tournament to in-progress
export async function startTournament(tournamentId) {
  const tournament = await Tournament.findById(tournamentId).populate("participants", "username");
  if (!tournament) {
    throw new BusinessLogicError("Tournament not found", 404);
  }

  if (tournament.status !== "upcoming") {
    throw new BusinessLogicError("Only upcoming tournaments can be started", 400);
  }

  if (tournament.participants.length < 2) {
    throw new BusinessLogicError("At least 2 participants are required to start a tournament", 400);
  }

  // Both rounds and timeControl are required by the Match schema, so check before trying to create matches
  if (!tournament.category.rounds) {
    throw new BusinessLogicError("Tournament category rounds must be set before starting", 400);
  }
  if (!tournament.category.timeControl) {
    throw new BusinessLogicError("Tournament category time control must be set before starting", 400);
  }

  // slice() makes a copy so we don't mutate the original participants array
  const shuffled = tournament.participants.slice().sort(function () {
    return 0.5 - Math.random();
  });

  const bracketMatches = [];
  const summary = [];
  let matchNumber = 1;

  // Pair up players two at a time; if there is an odd number, the last player has no match this round
  for (let i = 0; i + 1 < shuffled.length; i += 2) {
    const player1 = shuffled[i];
    const player2 = shuffled[i + 1];

    const newMatch = new Match({
      players: [
        { userId: player1._id },
        { userId: player2._id },
      ],
      maxPlayers: 2,
      category: tournament.category,
      status: "waiting",
      tournamentId: tournament._id,
      round: 1,
    });
    const savedMatch = await newMatch.save();

    bracketMatches.push({
      gameId: savedMatch._id,
      players: [player1._id, player2._id],
      winner: null,
    });

    summary.push("Match " + matchNumber + ": " + player1.username + " vs " + player2.username);
    matchNumber = matchNumber + 1;
  }

  tournament.bracket = [{ round: 1, matches: bracketMatches }];
  tournament.status = "in-progress";
  tournament.currentRound = 1;
  await tournament.save();

  return summary;
}


// Record who won a match, then re-pair all players for the next round or end the tournament after all rounds
export async function reportMatchResult(tournamentId, matchId, winnerId) {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new BusinessLogicError("Tournament not found", 404);
  }

  if (tournament.status !== "in-progress") {
    throw new BusinessLogicError("Can only report results for ongoing tournaments", 400);
  }

  // Search all rounds and matches to find the one matching the given ID
  let foundMatch = null;
  let matchFound = false;

  for (const round of tournament.bracket) {
    if (matchFound) {
      break;
    }
    for (const match of round.matches) {
      if (match._id.toString() === matchId) {
        foundMatch = match;
        matchFound = true;
        break;
      }
    }
  }

  if (!foundMatch) {
    throw new BusinessLogicError("Match not found", 404);
  }

  if (foundMatch.winner) {
    throw new BusinessLogicError("Match result has already been recorded", 400);
  }

  const winnerIsPlayer = foundMatch.players.some(function (playerId) {
    return playerId.toString() === winnerId;
  });
  if (!winnerIsPlayer) {
    throw new BusinessLogicError("Winner must be one of the match players", 400);
  }

  foundMatch.winner = winnerId;

  // The current round is always the last entry in the bracket array
  const currentRound = tournament.bracket[tournament.bracket.length - 1];
  const allMatchesDone = currentRound.matches.every(function (match) {
    return match.winner;
  });

  if (allMatchesDone) {
    if (tournament.currentRound < tournament.numberOfRounds) {
      // More rounds left, re-pair all participants randomly for the next round
      const nextRoundNumber = tournament.currentRound + 1;

      const shuffled = tournament.participants.slice().sort(function () {
        return 0.5 - Math.random();
      });

      const nextBracketMatches = [];

      for (let i = 0; i + 1 < shuffled.length; i += 2) {
        const newMatch = new Match({
          players: [
            { userId: shuffled[i] },
            { userId: shuffled[i + 1] },
          ],
          maxPlayers: 2,
          category: tournament.category,
          status: "waiting",
          tournamentId: tournament._id,
          round: nextRoundNumber,
        });
        const savedMatch = await newMatch.save();

        nextBracketMatches.push({
          gameId: savedMatch._id,
          players: [shuffled[i], shuffled[i + 1]],
          winner: null,
        });
      }

      tournament.bracket.push({
        round: nextRoundNumber,
        matches: nextBracketMatches,
      });
      tournament.currentRound = nextRoundNumber;
    } else {
      // All rounds done, count wins per participant across every round to find the winner
      const winCounts = {};

      for (const round of tournament.bracket) {
        for (const match of round.matches) {
          if (match.winner) {
            const matchWinnerId = match.winner.toString();
            if (winCounts[matchWinnerId] === undefined) {
              winCounts[matchWinnerId] = 0;
            }
            winCounts[matchWinnerId] = winCounts[matchWinnerId] + 1;
          }
        }
      }

      // The participant with the most wins across all rounds is the tournament winner
      let topWinnerId = null;
      let topWinCount = 0;

      for (const participantId of tournament.participants) {
        const participantIdStr = participantId.toString();
        let wins = 0;
        if (winCounts[participantIdStr] !== undefined) {
          wins = winCounts[participantIdStr];
        }
        if (wins > topWinCount) {
          topWinCount = wins;
          topWinnerId = participantIdStr;
        }
      }

      tournament.winnerId = topWinnerId;
      tournament.status = "completed";

      const trophyWinner = await User.findById(topWinnerId);
      if (trophyWinner) {
        let trophyImageUrl = null;
        if (tournament.trophy.imageUrl) {
          trophyImageUrl = tournament.trophy.imageUrl;
        }
        trophyWinner.trophies.push({
          title: tournament.trophy.title,
          imageUrl: trophyImageUrl,
          wonAt: new Date(),
        });
        // Award bonus points for winning the tournament
        trophyWinner.points = trophyWinner.points + TOURNAMENT_WIN_POINTS;
        await trophyWinner.save();
      }
    }
  }

  await tournament.save();

  const updatedTournament = await Tournament.findById(tournamentId)
    .populate("participants", "username")
    .populate("bracket.matches.players", "username")
    .populate("bracket.matches.winner", "username")
    .populate("winnerId", "username");

  return updatedTournament;
}


// Build the bracket standings view with player names and results per round
export async function getStandings(tournamentId) {
  const tournament = await Tournament.findById(tournamentId)
    .populate("bracket.matches.players", "username")
    .populate("bracket.matches.winner", "username")
    .populate("winnerId", "username");

  if (!tournament) {
    throw new BusinessLogicError("Tournament not found", 404);
  }

  const standings = tournament.bracket.map(function (round) {
    const matches = round.matches.map(function (match) {
      let player1Username = null;
      if (match.players[0]) {
        player1Username = match.players[0].username;
      }

      let player2Username = null;
      if (match.players[1]) {
        player2Username = match.players[1].username;
      }

      let winnerUsername = null;
      if (match.winner) {
        winnerUsername = match.winner.username;
      }

      return {
        player1: player1Username,
        player2: player2Username,
        winner: winnerUsername,
      };
    });

    return { round: round.round, matches: matches };
  });

  let tournamentWinner = null;
  if (tournament.winnerId) {
    tournamentWinner = tournament.winnerId.username;
  }

  return {
    title: tournament.title,
    status: tournament.status,
    winner: tournamentWinner,
    standings: standings,
  };
}


// Update only the fields that were sent, to avoid overwriting unrelated tournament data
export async function updateTournament(tournamentId, updateData) {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new BusinessLogicError("Tournament not found", 404);
  }

  if (updateData.title !== undefined) {
    tournament.title = updateData.title;
  }
  if (updateData.description !== undefined) {
    tournament.description = updateData.description;
  }
  if (updateData.rules !== undefined) {
    tournament.rules = updateData.rules;
  }
  if (updateData.startDate !== undefined) {
    tournament.startDate = updateData.startDate;
  }
  if (updateData.numberOfRounds !== undefined) {
    tournament.numberOfRounds = updateData.numberOfRounds;
  }
  if (updateData.buyIn !== undefined) {
    tournament.buyIn = updateData.buyIn;
  }
  if (updateData.trophyTitle !== undefined) {
    tournament.trophy.title = updateData.trophyTitle;
  }

  // category and eloRange are nested objects, so update their inner fields one by one
  if (updateData.category !== undefined) {
    if (updateData.category.rounds !== undefined) {
      tournament.category.rounds = updateData.category.rounds;
    }
    if (updateData.category.timeControl !== undefined) {
      tournament.category.timeControl = updateData.category.timeControl;
    }
    if (updateData.category.straightsAllowed !== undefined) {
      tournament.category.straightsAllowed = updateData.category.straightsAllowed;
    }
  }

  if (updateData.eloRange !== undefined) {
    if (updateData.eloRange.min !== undefined) {
      tournament.eloRange.min = updateData.eloRange.min;
    }
    if (updateData.eloRange.max !== undefined) {
      tournament.eloRange.max = updateData.eloRange.max;
    }
  }

  const savedTournament = await tournament.save();
  return savedTournament;
}


// Delete a tournament permanently by ID
export async function deleteTournament(tournamentId) {
  const tournament = await Tournament.findByIdAndDelete(tournamentId);
  if (!tournament) {
    throw new BusinessLogicError("Tournament not found", 404);
  }
  return tournament;
}


// Set a tournament's status to cancelled
export async function cancelTournament(tournamentId) {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new BusinessLogicError("Tournament not found", 404);
  }

  tournament.status = "cancelled";
  const savedTournament = await tournament.save();
  return savedTournament;
}
