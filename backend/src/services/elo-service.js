import User from "../models/User.js";

// Standard ELO expected score formula
// Source: https://www.geeksforgeeks.org/dsa/elo-rating-algorithm/
export function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

// Calculate new ELO ratings for a pair
export function calcEloPair(ratingA, ratingB, K, outcome) {
  const expectedA = expectedScore(ratingA, ratingB);
  const expectedB = expectedScore(ratingB, ratingA);

  const newRatingA = Math.round(ratingA + K * (outcome - expectedA));
  const newRatingB = Math.round(ratingB + K * (1 - outcome - expectedB));

  return { newRatingA, newRatingB };
}

// Update ELO ratings for two players after a match
export async function updateEloRating(winnerId, loserId, isDraw = false) {
  const winner = await User.findById(winnerId);
  const loser = await User.findById(loserId);

  if (!winner || !loser) {
    throw new Error("One or more players not found for ELO update");
  }

  const outcome = isDraw ? 0.5 : 1;
  const K = 32;

  const { newRatingA, newRatingB } = calcEloPair(
    winner.eloRating,
    loser.eloRating,
    K,
    outcome
  );

  winner.eloRating = newRatingA;
  loser.eloRating = newRatingB;

  await winner.save();
  await loser.save();

  return { winnerElo: newRatingA, loserElo: newRatingB };
}

// Multi-player ELO update: run pairwise comparisons
// Players who ended with more points "win" against those with fewer
export async function updateEloMultiplayer(playerResults) {
  // playerResults = [{ userId, finalPoints }, ...]
  // Sort by points descending
  const sorted = [...playerResults].sort((a, b) => b.finalPoints - a.finalPoints);

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const isDraw = sorted[i].finalPoints === sorted[j].finalPoints;
      if (isDraw) {
        await updateEloRating(sorted[i].userId, sorted[j].userId, true);
      } else {
        await updateEloRating(sorted[i].userId, sorted[j].userId, false);
      }
    }
  }
}
