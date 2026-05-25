import Tournament from "../models/Tournament.js";
import Match from "../models/Match.js";
import User from "../models/User.js";

// GET /api/tournaments?page=1&limit=10&sort=date&search=spring
export async function getAllTournaments(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    // Search by title (min 3 chars)
    if (req.query.search && req.query.search.length >= 3) {
      filter.title = { $regex: req.query.search, $options: "i" };
    }
    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Sort options
    let sortObj = { startDate: -1 };
    if (req.query.sort === "title") sortObj = { title: 1 };
    if (req.query.sort === "players") sortObj = { participantCount: -1 };
    if (req.query.sort === "date") sortObj = { startDate: -1 };

    const tournaments = await Tournament.find(filter)
      .populate("createdBy", "username")
      .populate("winnerId", "username")
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await Tournament.countDocuments(filter);

    res.json({ page, limit, total, results: tournaments });
  } catch (err) {
    next(err);
  }
}

// GET /api/tournaments/:id
export async function getTournament(req, res, next) {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("participants", "username eloRating profileImageUrl")
      .populate("winnerId", "username")
      .populate("bracket.matches.players", "username")
      .populate("bracket.matches.winner", "username");

    if (!tournament)
      return res.status(404).json({ error: "Tournament not found" });
    res.json(tournament);
  } catch (err) {
    next(err);
  }
}

// POST /api/tournaments — admin only
export async function createTournament(req, res, next) {
  try {
    const {
      title,
      description,
      rules,
      startDate,
      category,
      trophyTitle,
      numberOfRounds,
      buyIn,
      eloRange,
    } = req.body;

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const tournament = await Tournament.create({
      title,
      description,
      rules,
      startDate,
      createdBy: req.userId,
      category,
      numberOfRounds: numberOfRounds || 3,
      buyIn: buyIn || 0,
      eloRange: eloRange || { min: 0, max: 9999 },
      trophy: { title: trophyTitle || title, imageUrl },
    });

    res.status(201).json({ message: "Tournament created", tournament });
  } catch (err) {
    next(err);
  }
}

// POST /api/tournaments/:id/join — logged-in users only
export async function joinTournament(req, res, next) {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament)
      return res.status(404).json({ error: "Tournament not found" });

    if (tournament.status !== "upcoming") {
      return res
        .status(400)
        .json({ error: "Can only join upcoming tournaments" });
    }

    if (tournament.participants.includes(req.userId)) {
      return res.status(400).json({ error: "Already joined" });
    }

    // Check if user is banned
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.isBanned)
      return res.status(403).json({ error: "Banned users cannot join" });

    tournament.participants.push(req.userId);
    await tournament.save();

    res.json({ message: "Joined tournament", tournament });
  } catch (err) {
    next(err);
  }
}

// POST /api/tournaments/:id/leave
export async function leaveTournament(req, res, next) {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament)
      return res.status(404).json({ error: "Tournament not found" });

    tournament.participants = tournament.participants.filter(
      (p) => p.toString() !== req.userId
    );
    await tournament.save();

    res.json({ message: "Left tournament" });
  } catch (err) {
    next(err);
  }
}

// POST /api/tournaments/:id/start — admin only
// Shuffles players and creates round 1 matches (from Emil's logic)
export async function startTournament(req, res, next) {
  try {
    const tournament = await Tournament.findById(req.params.id).populate(
      "participants",
      "username"
    );
    if (!tournament)
      return res.status(404).json({ error: "Tournament not found" });

    if (tournament.status !== "upcoming") {
      return res.status(400).json({ error: "Only upcoming tournaments can start" });
    }

    if (tournament.participants.length < 2) {
      return res
        .status(400)
        .json({ error: "Need at least 2 participants to start" });
    }

    // Shuffle participants randomly
    const shuffled = [...tournament.participants].sort(
      () => Math.random() - 0.5
    );

    // Create matches for round 1
    const matches = [];
    for (let i = 0; i + 1 < shuffled.length; i += 2) {
      const match = await Match.create({
        players: [
          { userId: shuffled[i]._id },
          { userId: shuffled[i + 1]._id },
        ],
        maxPlayers: 2,
        category: tournament.category,
        status: "waiting",
        tournamentId: tournament._id,
        round: 1,
      });

      matches.push({
        gameId: match._id,
        players: [shuffled[i]._id, shuffled[i + 1]._id],
        winner: null,
      });
    }

    tournament.bracket = [{ round: 1, matches }];
    tournament.status = "in-progress";
    tournament.currentRound = 1;
    await tournament.save();

    const summary = matches.map((m, i) => {
      return `Match ${i + 1}: ${shuffled[i * 2].username} vs ${shuffled[i * 2 + 1].username}`;
    });

    res.json({ message: "Tournament started!", matches: summary });
  } catch (err) {
    next(err);
  }
}

// PUT /api/tournaments/:id/matches/:matchId/result — admin only
// Reports a match result and advances the bracket (from Emil)
export async function reportMatchResult(req, res, next) {
  try {
    const { id, matchId } = req.params;
    const { winnerId } = req.body;

    if (!winnerId)
      return res.status(400).json({ error: "winnerId is required" });

    const tournament = await Tournament.findById(id).populate(
      "bracket.matches.players",
      "username"
    );
    if (!tournament)
      return res.status(404).json({ error: "Tournament not found" });

    if (tournament.status !== "in-progress") {
      return res
        .status(400)
        .json({ error: "Can only report results for ongoing tournaments" });
    }

    // Find the match in the bracket
    let foundMatch = null;
    for (const round of tournament.bracket) {
      for (const match of round.matches) {
        if (match._id.toString() === matchId) {
          foundMatch = match;
          break;
        }
      }
    }

    if (!foundMatch) return res.status(404).json({ error: "Match not found" });
    if (foundMatch.winner)
      return res.status(400).json({ error: "Match already has a winner" });

    // Validate winner is one of the players
    const isValidWinner = foundMatch.players.some(
      (p) => p._id.toString() === winnerId
    );
    if (!isValidWinner) {
      return res
        .status(400)
        .json({ error: "Winner must be one of the match players" });
    }

    foundMatch.winner = winnerId;

    // Check if all matches in the current round are done
    const currentRound =
      tournament.bracket[tournament.bracket.length - 1];
    const allDone = currentRound.matches.every((m) => m.winner);

    if (allDone) {
      const roundWinners = currentRound.matches.map((m) => m.winner);

      if (roundWinners.length === 1) {
        // Tournament finished!
        tournament.winnerId = roundWinners[0];
        tournament.status = "completed";

        // Award trophy
        await User.findByIdAndUpdate(roundWinners[0], {
          $push: {
            trophies: {
              title: tournament.trophy.title,
              imageUrl: tournament.trophy.imageUrl || null,
              wonAt: new Date(),
            },
          },
        });
      } else {
        // Create next round
        const nextMatches = [];
        for (let i = 0; i + 1 < roundWinners.length; i += 2) {
          nextMatches.push({
            gameId: null,
            players: [roundWinners[i], roundWinners[i + 1]],
            winner: null,
          });
        }

        tournament.bracket.push({
          round: currentRound.round + 1,
          matches: nextMatches,
        });
        tournament.currentRound = currentRound.round + 1;
      }
    }

    await tournament.save();

    // Return updated tournament
    const updated = await Tournament.findById(id)
      .populate("participants", "username")
      .populate("bracket.matches.players", "username")
      .populate("bracket.matches.winner", "username")
      .populate("winnerId", "username");

    res.json({ message: "Result recorded", tournament: updated });
  } catch (err) {
    next(err);
  }
}

// GET /api/tournaments/:id/standings
export async function getStandings(req, res, next) {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate("bracket.matches.players", "username")
      .populate("bracket.matches.winner", "username")
      .populate("winnerId", "username");

    if (!tournament)
      return res.status(404).json({ error: "Tournament not found" });

    const standings = tournament.bracket.map((round) => ({
      round: round.round,
      matches: round.matches.map((m) => ({
        player1: m.players[0]?.username,
        player2: m.players[1]?.username,
        winner: m.winner?.username,
      })),
    }));

    res.json({
      title: tournament.title,
      status: tournament.status,
      winner: tournament.winnerId?.username ?? null,
      standings,
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/tournaments/:id — admin only, update tournament details
export async function updateTournament(req, res, next) {
  try {
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!tournament)
      return res.status(404).json({ error: "Tournament not found" });
    res.json({ message: "Tournament updated", tournament });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/tournaments/:id — admin only
export async function deleteTournament(req, res, next) {
  try {
    const tournament = await Tournament.findByIdAndDelete(req.params.id);
    if (!tournament)
      return res.status(404).json({ error: "Tournament not found" });
    res.json({ message: "Tournament deleted" });
  } catch (err) {
    next(err);
  }
}

// POST /api/tournaments/:id/cancel — admin only
export async function cancelTournament(req, res, next) {
  try {
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );
    if (!tournament)
      return res.status(404).json({ error: "Tournament not found" });
    res.json({ message: "Tournament cancelled", tournament });
  } catch (err) {
    next(err);
  }
}
