import Match from "../models/Match.js";
import User from "../models/User.js";
import { updateEloRating } from "../services/elo-service.js";
import { joinMatchQueue } from "../services/matchmaking-service.js";

// GET /api/matches?page=1&limit=10&status=waiting&playerId=xxx
export async function getAllMatches(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.playerId) {
      filter["players.userId"] = req.query.playerId;
    }

    const matches = await Match.find(filter)
      .populate("players.userId", "username eloRating profileImageUrl")
      .populate("winnerId", "username")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Match.countDocuments(filter);

    res.json({ page, limit, total, results: matches });
  } catch (err) {
    next(err);
  }
}

// GET /api/matches/:id
export async function getMatch(req, res, next) {
  try {
    const match = await Match.findById(req.params.id)
      .populate("players.userId", "username eloRating profileImageUrl")
      .populate("winnerId", "username");
    if (!match) return res.status(404).json({ error: "Match not found" });
    res.json(match);
  } catch (err) {
    next(err);
  }
}

// POST /api/matches — create a game room
export async function createMatch(req, res, next) {
  try {
    const { rounds, straightsAllowed, timeControl, maxPlayers, buyIn } = req.body;
    const isAnonymous = !req.userId;
    const userId = req.userId ?? null;

    // Check buy-in points
    if (!isAnonymous && buyIn) {
      const user = await User.findById(userId);
      if (user && user.points < buyIn) {
        return res.status(400).json({ error: "Not enough points for buy-in" });
      }
    }

    const match = await Match.create({
      players: [{ userId, stack: buyIn || 0 }],
      maxPlayers: maxPlayers || 2,
      category: {
        rounds,
        straightsAllowed: straightsAllowed !== false,
        timeControl,
      },
      buyIn: buyIn || 1,
      status: "waiting",
      isAnonymous,
    });

    res.status(201).json({ message: "Game created", match });
  } catch (err) {
    next(err);
  }
}

// POST /api/matches/:id/join
export async function joinMatch(req, res, next) {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ error: "Match not found" });

    if (match.status !== "waiting") {
      return res.status(400).json({ error: "Match is not open to join" });
    }

    const userId = req.userId;

    // Check if already in the game
    const alreadyIn = match.players.some(
      (p) => p.userId?.toString() === userId
    );
    if (alreadyIn) {
      return res.status(400).json({ error: "Already in this game" });
    }

    // Check if game is full
    if (match.players.length >= match.maxPlayers) {
      return res.status(400).json({ error: "Game is full" });
    }

    // Check buy-in
    if (!match.isAnonymous && match.buyIn) {
      const user = await User.findById(userId);
      if (user && user.points < match.buyIn) {
        return res.status(400).json({ error: "Not enough points for buy-in" });
      }
    }

    match.players.push({ userId, stack: match.buyIn || 0 });

    // Start the game if we have enough players
    if (match.players.length >= match.maxPlayers) {
      match.status = "in-progress";
      match.startedAt = new Date();
    }

    await match.save();
    res.json({ message: "Joined match", match });
  } catch (err) {
    next(err);
  }
}

// POST /api/matches/:id/leave — leave before start
export async function leaveMatch(req, res, next) {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ error: "Match not found" });

    if (match.status !== "waiting") {
      return res.status(400).json({ error: "Cannot leave a match that has started" });
    }

    match.players = match.players.filter(
      (p) => p.userId?.toString() !== req.userId
    );

    // Delete the match if no players left
    if (match.players.length === 0) {
      await match.deleteOne();
      return res.json({ message: "Match deleted (no players left)" });
    }

    await match.save();
    res.json({ message: "Left the match", match });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/matches/:id/result — record match result
export async function recordResult(req, res, next) {
  try {
    const { winnerId, score } = req.body;

    const match = await Match.findByIdAndUpdate(
      req.params.id,
      { winnerId, score, status: "completed", endedAt: new Date() },
      { new: true }
    );
    
    if (!match) return res.status(404).json({ error: "Match not found" });

    res.json(match);
  } catch (err) {
    next(err);
  }
}
