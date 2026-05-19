import tournamentServices from "../services/tournamentService.js";

// Paginated list of all tournaments.
export async function getTournaments(req, res) {
  try {
    // if page not specified in query, page 1 is default
    // if limit not specified in query, 10 items is default
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const allTournaments = await tournamentServices.getAllTournaments(
      page,
      limit,
    );
    if (allTournaments.length === 0) {
      return res.status(404).json({ Error: "Could not find any tournaments" });
    }
    res.status(200).json({ allTournaments });
  } catch (err) {
    res.status(500).json({ Error: err.message });
  }
}

// return a tournament from its id.
export async function getOneTournament(req, res) {
  try {
    const tournamentObj = await tournamentServices.getATournament(
      req.params.id,
    );
    if (!tournamentObj) {
      return res.status(404).json({
        Error: `Could not find any tournaments with id ${req.params.id}`,
      });
    }
    return res.status(200).json({ ...tournamentObj });
  } catch (err) {
    res.status(500).json({ Error: err.message });
  }
}

// Creates a new tournament. Admin is only allowed to do this.
export async function createTournament(req, res) {
  try {
    // Fields come from req.body, and are validated by user.auth in middleware before coming here.
    const tournament = await tournamentServices.createTournament(req.body);
    res.status(201).json({ Message: "Tournament is created!", tournament });
  } catch (err) {
    res.status(500).json({ Error: err.message });
  }
}

// Uploads a trophy for a tournament. Admin only!
export async function uploadTrophy(req, res) {
  try {
    if (!req.file)
      return res.status(400).json({ Message: "Trophy image is required!" });
    const tournament = await tournamentServices.uploadTrophyImage(
      req.params.id,
      req.file.path,
    );
    if (!tournament)
      return res.status(404).json({ Error: "This tournament does not exist!" });
    res.status(200).json({ Message: "Trophy image uploaded!" });
  } catch (err) {
    res.status(500).json({ Error: err.message });
  }
}

// enrolls a single user into a tournament pool!
export async function enrollUserIntoTournament(req, res) {
  try {
    const tournament = await tournamentServices.enrollUser(
      req.params.id,
      req.user.id,
    );
    res.status(200).json({
      Message: "User successfully enrolled into tournament!",
      tournament,
    });
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
}

// starts a tournament and randomly pairs players. Only admin can start tournaments.
// Handles creating game for tournaments, shuffling players and building brackets.
export async function startTournament(req, res) {
  try {
    const matchSummary = await tournamentServices.startTournament(
      req.params.id,
    );
    res.status(200).json({
      Message: "Tournament is starting! Have fun!",
      matches: matchSummary,
    });
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
}

export async function updateTournament(req, res) {
  try {
    // Only fields sent in req.body is updated. Everything else stays untouched if not specified!
    const tournament = await tournamentServices.updateTournament(
      req.params.id,
      req.body,
    );
    if (!tournament)
      return res.status(404).json({ Error: "Tournament was not found" });
    res.status(200).json({ Message: "Tournament is updated!", tournament });
  } catch (err) {
    res.status(500).json({ Error: err.message });
  }
}

// Reports the result of a match!
// This also handles advancing round winners to the next round and crowning the tournament winner.
export async function matchResult(req, res) {
  try {
    const { id, matchId } = req.params;
    const { winnerId } = req.body;
    if (!winnerId)
      return res.status(400).json({ Error: "winnerId is required!" });
    const tournament = await tournamentServices.reportMatchResult(
      id,
      matchId,
      winnerId,
    );
    res
      .status(200)
      .json({ Message: "Match result reported successfully!", tournament });
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
}

// Deletes a tournament. Admin can only do this!
export async function deleteTournament(req, res) {
  try {
    const tournament = await tournamentServices.deleteTournament(req.params.id);
    if (!tournament)
      return res.status(404).json({ Error: "Could not find any tournaments" });
    res.status(200).json({ Message: "Tournament deleted successfully!" });
  } catch (err) {
    res.status(500).json({ Error: err.message });
  }
}

// Returns the bracket standings. Standings include all rounds, match result and tournament winner.
export async function getTournamentStandings(req, res) {
  try {
    const standings = await tournamentServices.getTournamentStandings(
      req.params.id,
    );
    res.status(200).json(standings);
  } catch (err) {
    res.status(404).json({ Error: err.message });
  }
}

export default {
  enrollUserIntoTournament,
  createTournament,
  startTournament,
  updateTournament,
  getTournaments,
  getOneTournament,
  uploadTrophy,
  matchResult,
  deleteTournament,
  getTournamentStandings,
};
