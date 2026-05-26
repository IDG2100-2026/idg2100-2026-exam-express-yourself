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


// Get a paginated, filtered list of tournaments (GET /api/tournaments?page=&limit=&status=&search=&sort=)
export async function getAllTournaments(req, res, next) {
  const result = await getAllTournamentsService(req.validated);
  res.json(result);
}


// Get a single tournament with all its details (GET /api/tournaments/:id)
export async function getTournament(req, res, next) {
  const tournament = await getTournamentService(req.params.id);
  res.json(tournament);
}


// Create a new tournament with an optional trophy image (POST /api/tournaments)
export async function createTournament(req, res, next) {
  let imageUrl = null;
  if (req.file) {
    imageUrl = "/uploads/" + req.file.filename;
  }
  const tournament = await createTournamentService(req.userId, req.validated, imageUrl);
  res.status(201).json({ message: "Tournament created", tournament });
}


// Join a tournament as a participant (POST /api/tournaments/:id/join)
export async function joinTournament(req, res, next) {
  const tournament = await joinTournamentService(req.params.id, req.userId);
  res.json({ message: "Joined tournament", tournament });
}


// Leave a tournament before it starts (POST /api/tournaments/:id/leave)
export async function leaveTournament(req, res, next) {
  await leaveTournamentService(req.params.id, req.userId);
  res.json({ message: "Left tournament" });
}


// Start a tournament and generate the first round of matches (POST /api/tournaments/:id/start)
export async function startTournament(req, res, next) {
  const matches = await startTournamentService(req.params.id);
  res.json({ message: "Tournament started", matches });
}


// Record the result of a bracket match and advance the round if done (PUT /api/tournaments/:id/matches/:matchId/result)
export async function reportMatchResult(req, res, next) {
  const tournament = await reportMatchResultService(
    req.params.id,
    req.params.matchId,
    req.validated.winnerId,
  );
  res.json({ message: "Result recorded", tournament });
}


// Get the bracket standings for a tournament (GET /api/tournaments/:id/standings)
export async function getStandings(req, res, next) {
  const standings = await getStandingsService(req.params.id);
  res.json(standings);
}


// Update tournament details (PUT /api/tournaments/:id)
export async function updateTournament(req, res, next) {
  const tournament = await updateTournamentService(req.params.id, req.validated);
  res.json({ message: "Tournament updated", tournament });
}


// Delete a tournament permanently (DELETE /api/tournaments/:id)
export async function deleteTournament(req, res, next) {
  await deleteTournamentService(req.params.id);
  res.json({ message: "Tournament deleted" });
}


// Cancel a tournament (POST /api/tournaments/:id/cancel)
export async function cancelTournament(req, res, next) {
  const tournament = await cancelTournamentService(req.params.id);
  res.json({ message: "Tournament cancelled", tournament });
}
