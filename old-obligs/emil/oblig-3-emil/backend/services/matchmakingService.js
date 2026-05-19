import { Game } from "../models/game.js";

// In memory waiting queue.
const gameQueue = [];

//
function getEloRange(queuedAt) {
  // The longer the wait is, the more relaxed the requirement becomes!
  const waiting = Date.now() - queuedAt;
  if (waiting < 3000) return 100; // elo range goes up by 100 every 30 seconds
  if (waiting < 6000) return 200; // elo range goes up by 200 every minute
  return 500; // goes up 500 if waiting is over a minute!
}

/**
 * Tries to find a match for the incoming player!
 * if match is found, create a game
 * if match is not found, add player to queue
 */
export async function joinMatchQueue(userId, eloRating, variant, isAnonymous) {
  const matchIndex = gameQueue.findIndex((candidate) => {
    // Finding players that is playing the same game variant! PlayerA cant play best of 3 and playerB play a best of 7.
    if (candidate.variant.rounds !== variant.rounds) return false;
    if (candidate.variant.timeControl !== variant.timeControl) return false;
    if (candidate.variant.straightAllowed !== variant.straightAllowed)
      return false;

    // Anonymous players can only play against other anonymous players!
    if (isAnonymous && candidate.isAnonymous) return true;

    // Registered players must be within elo range!
    if (!isAnonymous && !candidate.isAnonymous) {
      const eloDifference = Math.abs(candidate.eloRating - eloRating);
      return eloDifference <= getEloRange(candidate.queuedAt);
    }
    return false; // Don't mix up anonymous and registered players.
  });

  if (matchIndex !== -1) {
    const [opponent] = gameQueue.splice(matchIndex, 1);
    const game = await Game.create({
      players: isAnonymous
        ? [{ userId: null }, { userId: null }]
        : [{ userId: opponent.userId }, { userId }],
      variant,
      status: "Ongoing",
      isAnonymous,
    });
    return { status: "matched", game };
  }

  // no match found. Add to queue
  gameQueue.push({
    userId,
    eloRating,
    variant,
    isAnonymous,
    queuedAt: Date.now(),
  });
  return { status: "waiting" };
}
