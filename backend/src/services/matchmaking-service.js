import Match from "../models/Match.js";

// In-memory waiting queue
const matchQueue = [];

// The longer the wait, the wider the ELO range accepted
function getEloRange(queuedAt) {
  const waitingMs = Date.now() - queuedAt;
  if (waitingMs < 30000) return 100;
  if (waitingMs < 60000) return 200;
  return 500;
}

// Try to match the player, or add them to the queue
export async function joinMatchQueue(userId, eloRating, category, isAnonymous) {
  const matchIndex = matchQueue.findIndex((candidate) => {
    // Must be same game variant
    if (candidate.category.rounds !== category.rounds) return false;
    if (candidate.category.timeControl !== category.timeControl) return false;
    if (candidate.category.straightsAllowed !== category.straightsAllowed)
      return false;

    // Anonymous players match with anonymous only
    if (isAnonymous && candidate.isAnonymous) return true;

    // Registered players must be within ELO range
    if (!isAnonymous && !candidate.isAnonymous) {
      const eloDiff = Math.abs(candidate.eloRating - eloRating);
      return eloDiff <= getEloRange(candidate.queuedAt);
    }

    return false;
  });

  if (matchIndex !== -1) {
    const [opponent] = matchQueue.splice(matchIndex, 1);
    const match = await Match.create({
      players: isAnonymous
        ? [{ userId: null }, { userId: null }]
        : [{ userId: opponent.userId }, { userId }],
      category,
      status: "in-progress",
      isAnonymous,
      startedAt: new Date(),
    });
    return { status: "matched", match };
  }

  // No match found — add to queue
  matchQueue.push({
    userId,
    eloRating,
    category,
    isAnonymous,
    queuedAt: Date.now(),
  });

  return { status: "waiting" };
}

// Remove a player from the queue (e.g. if they cancel)
export function leaveMatchQueue(userId) {
  const index = matchQueue.findIndex((c) => c.userId?.toString() === userId);
  if (index !== -1) matchQueue.splice(index, 1);
}
