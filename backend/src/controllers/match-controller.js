import {
  getAllMatches as getAllMatchesService,
  getMatch as getMatchService,
  createMatch as createMatchService,
  joinMatch as joinMatchService,
  leaveMatch as leaveMatchService,
  recordResult as recordResultService,
} from "../services/match-service.js";
import { sendToRoom } from "../websockets/helpers.js";


// Get a paginated list of all matches in the lobby (GET /api/matches?page=&limit=&status=&playerId=&rounds=&timeControl=&straightsAllowed=)
export async function getAllMatches(req, res, next) {
  const data = await getAllMatchesService(req.validated);
  res.status(200);
  res.json(data);
}


// Get a single match by ID (GET /api/matches/:id)
export async function getMatch(req, res, next) {
  const match = await getMatchService(req.params.id);
  res.status(200);
  res.json(match);
}


// Create a new match room and join as the first player (POST /api/matches)
export async function createMatch(req, res, next) {
  const match = await createMatchService(req.userId, req.validated);
  res.status(201);
  res.json({ message: "Game created", match });
}


// Join an existing match as a player (POST /api/matches/:id/join)
export async function joinMatch(req, res, next) {
  const match = await joinMatchService(req.params.id, req.userId);

  if (match.status === "in-progress") {

    // Notify the WebSocket room that the game has started
    sendToRoom(req.params.id, {
      type: "game:started",
      players: match.players,
      currentPlayerIndex: match.currentPlayerIndex,
      phase: match.phase,
      currentRound: match.currentRound,
      totalRounds: match.category.rounds,
    });
  }

  res.status(200);
  res.json({ message: "Joined match", match });
}


// Leave a match and get a buy-in refund if still waiting (POST /api/matches/:id/leave)
export async function leaveMatch(req, res, next) {
  const result = await leaveMatchService(req.params.id, req.userId);
  if (result.deleted === true) {
    res.status(200);
    return res.json({ message: "Match deleted (no players left)" });
  }
  res.status(200);
  res.json({ message: "Left the match", match: result.match });
}


// Record the winner and update all player ratings (PATCH /api/matches/:id/result)
export async function recordResult(req, res, next) {
  const match = await recordResultService(
    req.params.id,
    req.validated.winnerId,
    req.validated.score,
  );
  res.status(200);
  res.json(match);
}
