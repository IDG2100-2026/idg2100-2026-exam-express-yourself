import {
  getAllMatches as getAllMatchesService,
  getMatch as getMatchService,
  createMatch as createMatchService,
  joinMatch as joinMatchService,
  leaveMatch as leaveMatchService,
  recordResult as recordResultService,
} from "../services/match-service.js";

// GET /api/matches
export async function getAllMatches(req, res, next) {
  try {
    const data = await getAllMatchesService(req.validated);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/matches/:id
export async function getMatch(req, res, next) {
  try {
    const match = await getMatchService(req.params.id);
    res.json(match);
  } catch (err) {
    next(err);
  }
}

// POST /api/matches
export async function createMatch(req, res, next) {
  try {
    const match = await createMatchService(req.userId, req.validated);
    res.status(201).json({ message: "Game created", match });
  } catch (err) {
    next(err);
  }
}

// POST /api/matches/:id/join
export async function joinMatch(req, res, next) {
  try {
    const match = await joinMatchService(req.params.id, req.userId);
    res.json({ message: "Joined match", match });
  } catch (err) {
    next(err);
  }
}

// POST /api/matches/:id/leave
export async function leaveMatch(req, res, next) {
  try {
    const result = await leaveMatchService(req.params.id, req.userId);
    if (result.deleted === true) {
      return res.json({ message: "Match deleted (no players left)" });
    }
    res.json({ message: "Left the match", match: result.match });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/matches/:id/result
export async function recordResult(req, res, next) {
  try {
    const match = await recordResultService(
      req.params.id,
      req.validated.winnerId,
      req.validated.score,
    );
    if (!match) return res.status(404).json({ error: "Match not found" });
    res.json(match);
  } catch (err) {
    next(err);
  }
}
