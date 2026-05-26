import User from "../models/User.js";
import { ELO_FIELD_BY_TIME_CONTROL } from "../config/constants.js";


// Calculate the expected score for a player given two ratings (source: https://www.geeksforgeeks.org/dsa/elo-rating-algorithm/)
export function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}


// Calculate the new ratings for both players after a match outcome
export function calcEloPair(ratingA, ratingB, K, outcome) {
  const expectedA = expectedScore(ratingA, ratingB);
  const expectedB = expectedScore(ratingB, ratingA);

  const newRatingA = Math.round(ratingA + K * (outcome - expectedA));
  const newRatingB = Math.round(ratingB + K * (1 - outcome - expectedB));

  return { newRatingA, newRatingB };
}


// Update ELO ratings for two players after a match, using the rating for that time control
export async function updateEloRating(winnerId, loserId, timeControl, isDraw = false) {
  const winner = await User.findById(winnerId);
  const loser = await User.findById(loserId);

  if (!winner || !loser) {
    throw new Error("One or more players not found for ELO update");
  }

  let eloField = ELO_FIELD_BY_TIME_CONTROL[timeControl];
  if (eloField === undefined) {
    eloField = "tc30";
  }

  let outcome = 1;
  if (isDraw) {
    outcome = 0.5;
  }

  const K = 32;

  const { newRatingA, newRatingB } = calcEloPair(
    winner.eloRating[eloField],
    loser.eloRating[eloField],
    K,
    outcome,
  );

  winner.eloRating[eloField] = newRatingA;
  loser.eloRating[eloField] = newRatingB;

  await winner.save();
  await loser.save();

  return { winnerElo: newRatingA, loserElo: newRatingB };
}


// Update ELO for games with more than 2 players, comparing each player against every other
export async function updateEloMultiplayer(playerResults, timeControl) {
  const sorted = [...playerResults].sort(function (a, b) {
    return b.finalPoints - a.finalPoints;
  });

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const isDraw = sorted[i].finalPoints === sorted[j].finalPoints;
      if (isDraw) {
        await updateEloRating(sorted[i].userId, sorted[j].userId, timeControl, true);
      } else {
        await updateEloRating(sorted[i].userId, sorted[j].userId, timeControl, false);
      }
    }
  }
}
