import {
  getAllTournaments as getAllTournamentsService,
  getTournament as getTournamentService,
  createTournament as createTournamentService,
  joinTournament as joinTournamentService,
  leaveTournament as leaveTournamentService,
  startTournament as startTournamentService,
  reportMatchResult as reportMatchResultService,
  getStandings as getStandingsService,
  updateTournament as updateTournamentService,
  deleteTournament as deleteTournamentService,
  cancelTournament as cancelTournamentService,
} from "../services/tournament-service.js";


// Get a paginated, filtered list of tournaments
export async function getAllTournaments(req, res, next) {
  try {
    const result = await getAllTournamentsService(req.validated);
    res.json(result);
  } catch (err) {
    next(err);
  }
}


// Get a single tournament by ID with all its details
export async function getTournament(req, res, next) {
  try {
    const tournament = await getTournamentService(req.params.id);
    res.json(tournament);
  } catch (err) {
    next(err);
  }
}


// Create a new tournament; the trophy image file is handled by multer before this runs
export async function createTournament(req, res, next) {
  try {
    let imageUrl = null;
    if (req.file) {
      imageUrl = "/uploads/" + req.file.filename;
    }

    const tournament = await createTournamentService(req.userId, req.validated, imageUrl);
    res.status(201).json({ message: "Tournament created", tournament });
  } catch (err) {
    next(err);
  }
}


// Join a tournament as a participant
export async function joinTournament(req, res, next) {
  try {
    const tournament = await joinTournamentService(req.params.id, req.userId);
    res.json({ message: "Joined tournament", tournament });
  } catch (err) {
    next(err);
  }
}


// Leave a tournament
export async function leaveTournament(req, res, next) {
  try {
    await leaveTournamentService(req.params.id, req.userId);
    res.json({ message: "Left tournament" });
  } catch (err) {
    next(err);
  }
}


// Start a tournament, shuffle participants, and generate round 1 matches
export async function startTournament(req, res, next) {
  try {
    const matches = await startTournamentService(req.params.id);
    res.json({ message: "Tournament started!", matches });
  } catch (err) {
    next(err);
  }
}


// Record the result of a bracket match and advance the tournament if the round is done
export async function reportMatchResult(req, res, next) {
  try {
    const tournament = await reportMatchResultService(
      req.params.id,
      req.params.matchId,
      req.validated.winnerId,
    );
    res.json({ message: "Result recorded", tournament });
  } catch (err) {
    next(err);
  }
}


// Get the bracket standings for a tournament
export async function getStandings(req, res, next) {
  try {
    const standings = await getStandingsService(req.params.id);
    res.json(standings);
  } catch (err) {
    next(err);
  }
}


// Update tournament details
export async function updateTournament(req, res, next) {
  try {
    const tournament = await updateTournamentService(req.params.id, req.validated);
    res.json({ message: "Tournament updated", tournament });
  } catch (err) {
    next(err);
  }
}


// Delete a tournament permanently
export async function deleteTournament(req, res, next) {
  try {
    await deleteTournamentService(req.params.id);
    res.json({ message: "Tournament deleted" });
  } catch (err) {
    next(err);
  }
}


// Cancel a tournament
export async function cancelTournament(req, res, next) {
  try {
    const tournament = await cancelTournamentService(req.params.id);
    res.json({ message: "Tournament cancelled", tournament });
  } catch (err) {
    next(err);
  }
}
