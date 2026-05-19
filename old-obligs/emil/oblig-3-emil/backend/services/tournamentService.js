import { Tournament } from "../models/tournament.js";
import { User } from "../models/user.js";
import { Game } from "../models/game.js";

// Returns a paginated list of all tournaments
// .lean returns plain JS object instead of mongoose documents.
export async function getAllTournaments(page, limit) {
  return await Tournament.find()
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
}

// Retrives a single tournament by its MongoDB object id.
// Populate players usernames within bracket, so the frontend can recice readable data
export async function getATournament(id) {
  return await Tournament.findOne({ _id: id })
    .populate("participants", "username")
    .populate("bracket.matches.players", "username")
    .lean();
}

// Creates a new tournament document.
// Validation is handled in the middleware before this is created, because user-type needs to be admin.
export async function createTournament(data) {
  const tournament = new Tournament(data);
  await tournament.save();
  return tournament;
}

// Updates a torunament using $set, ensuring only provided fields get updated.
// Use runValidator true because of schema validation on the updated fields.
// new true returns the updated document instead of the old one.
export async function updateTournament(id, data) {
  return await Tournament.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true },
  );
}

// Deletes a tournament from its id.
// If tournament is already deleted or not existing, controller send a 404.
export async function deleteTournament(id) {
  return await Tournament.findByIdAndDelete({ _id: id });
}

// Attaches a trophy image file path to an existing tournament.
//File path comes from multer
export async function uploadTrophyImage(id, filePath) {
  const tournament = await Tournament.findOne({ _id: id });
  if (!tournament) return null;
  tournament.trophy.tournamentTrophy = filePath;
  await tournament.save();
  return tournament;
}

// Enrolls a user into a tournament participant pool.
// Also checks if the user is not banned, or already in a tournament. If so, they get a 400 response in controller
export async function enrollUser(tournamentId, userId) {
  await checkIfUserIsAlreadyEnrolledInATournament(userId);
  await checkIfUserIsBanned(userId);

  const tournament = await Tournament.findOne({ _id: tournamentId });
  if (!tournament) throw new Error("Tournament was not found!");
  if (tournament.status !== "Upcoming")
    throw new Error("You cannot join a tournament that has already started!");
  if (tournament.participants.length >= 8)
    throw new Error(
      "Tournament is full! Max 8 players is allowed in a tournament! Sorry....",
    );

  tournament.participants.push(userId);
  await tournament.save();
  return tournament;
}

// Starts a tournament by pairing 8 players randomly into first round.
// For each pair a game document is created.
export async function startTournament(id) {
  const tournament = await Tournament.findOne({ _id: id }).populate(
    "participants",
    "username",
  );
  if (!tournament) throw new Error("Tournament was not found!");
  if (tournament.status !== "Upcoming")
    throw new Error("Only upcoming tournaments can be started!");
  if (tournament.participants.length !== 8)
    throw new Error(
      `We need 8 players to start the tournament. Right now we have: ${tournament.participants.length}`,
    );

  // Shuffle participants into random order
  const playerShuffle = [...tournament.participants].sort(
    () => Math.random() - 0.5,
  );

  const matches = [];
  for (let i = 0; i < playerShuffle.length; i += 2) {
    const newGame = await Game.create({
      players: [
        { userId: playerShuffle[i]._id },
        { userId: playerShuffle[i + 1]._id },
      ],
      variant: {
        rounds: tournament.format.rounds,
        straightAllowed: tournament.format.straightAllowed,
        timeControl: tournament.format.timeControl,
      },
      isAnonymous: false,
      status: "Upcoming",
    });

    matches.push({
      gameId: newGame._id,
      players: [playerShuffle[i]._id, playerShuffle[i + 1]._id],
      winner: null,
    });
  }

  tournament.bracket = [{ round: 1, matches }];
  tournament.status = "Ongoing";
  await tournament.save();

  const matchSummary = matches.map((match, index) => {
    return `Match ${index + 1}: ${playerShuffle[index * 2].username} vs ${playerShuffle[index * 2 + 1].username}`;
  });

  return matchSummary;
}

// Records the result of a specific match within a tournament bracket
// Returns the fully populated tournament document so the client can see the updated bracket
export async function reportMatchResult(tournamentId, matchId, winnerId) {
  // Fetch tournament and populate bracket with player username data
  const tournament = await Tournament.findOne({ _id: tournamentId }).populate(
    "bracket.matches.players",
    "username",
  );

  if (!tournament) throw new Error("Tournament not found!");

  // Validate tournament's state
  if (tournament.status !== "Ongoing")
    throw new Error("Can only report results for ongoing tournaments!");

  // Search through all rounds and matches to find the specific match by ID
  let foundMatch = null;
  for (const round of tournament.bracket) {
    for (const match of round.matches) {
      if (match._id.toString() === matchId) {
        foundMatch = match;
        break;
      }
    }
  }

  if (!foundMatch) throw new Error("Match not found!");

  if (foundMatch.winner) throw new Error("This match already has a winner!");

  // Validate that the winner is one of the two players in this match
  const isValidWinner = foundMatch.players.some(
    (player) => player._id.toString() === winnerId,
  );
  if (!isValidWinner)
    throw new Error("Winner must be one of the two players in this match!");

  foundMatch.winner = winnerId;

  // Get the current round and check if all matches have winners
  const currentRound = tournament.bracket[tournament.bracket.length - 1];
  const allMatchesDone = currentRound.matches.every((match) => match.winner);

  // If all matches in the current round are complete, advance
  if (allMatchesDone) {
    // Get winners from the current round
    const roundWinners = currentRound.matches.map((match) => match.winner);

    // If only one winner remains, the tournament is finished
    if (roundWinners.length === 1) {
      tournament.winner = roundWinners[0];
      tournament.status = "Finished";

      await User.findByIdAndUpdate(roundWinners[0], {
        $push: {
          trophies: {
            title: tournament.trophy.title,
            tournamentTrophy: tournament.trophy.tournamentTrophy || null,
          },
        },
      });
    } else {
      // create the next round by pairing the winners
      const nextMatches = [];
      for (let i = 0; i < roundWinners.length; i += 2) {
        nextMatches.push({
          gameId: null,
          players: [roundWinners[i], roundWinners[i + 1]],
          winner: null,
        });
      }

      // Add the new round to the tournament bracket
      tournament.bracket.push({
        round: currentRound.round + 1,
        matches: nextMatches,
      });
    }
  }

  // Save the updated tournament to the database
  await tournament.save();

  // Return the fully populated updated tournament
  return await Tournament.findOne({ _id: tournamentId })
    .populate("participants", "username")
    .populate("bracket.matches.players", "username")
    .populate("bracket.matches.winner", "username")
    .populate("winner", "username");
}

export async function getTournamentStandings(id) {
  const tournament = await Tournament.findOne({ _id: id })
    .populate("bracket.matches.players", "username")
    .populate("bracket.matches.winner", "username")
    .populate("winner", "username");

  if (!tournament) throw new Error("No tournaments found");

  const standings = tournament.bracket.map((round) => ({
    round: round.round,
    matches: round.matches.map((match) => ({
      player1: match.players[0]?.username,
      player2: match.players[1]?.username,
      winner: match.winner?.username,
    })),
  }));

  return {
    tournament: tournament.title,
    status: tournament.status,
    winner: tournament.winner?.username ?? null,
    standings,
  };
}

// checks if the user is already enrolled in another tournament. A bit long function name but....
export async function checkIfUserIsAlreadyEnrolledInATournament(userId) {
  const activeTournament = await Tournament.findOne({
    participants: userId,
    status: { $in: ["Upcoming", "Ongoing"] },
  });
  if (activeTournament)
    throw new Error("You are already enrolled in a tournament");
}

// Checks if the user is banned. If so they cant join a game or tournament. Only admin can ban players.
export async function checkIfUserIsBanned(userId) {
  const user = await User.findOne({ _id: userId });
  if (!user) throw new Error("User does not exist!");
  if (user.isBanned)
    throw new Error(`${user.username} is banned, and cannot join`);
}

// Chacks that the startdate is not in the past!
export function validateDate(startTime) {
  if (new Date(startTime) <= new Date())
    throw new Error("Start time must be in the future!");
  return true;
}

export default {
  getAllTournaments,
  getATournament,
  createTournament,
  updateTournament,
  deleteTournament,
  uploadTrophyImage,
  enrollUser,
  startTournament,
  reportMatchResult,
  getTournamentStandings,
  checkIfUserIsAlreadyEnrolledInATournament,
  checkIfUserIsBanned,
  validateDate,
};
