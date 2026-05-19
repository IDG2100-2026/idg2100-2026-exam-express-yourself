import { User } from "../models/user.js";

export function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400)); // https://www.geeksforgeeks.org/dsa/elo-rating-algorithm/
}

export function eloRating(ratingA, ratingB, K, outcome) {
  // https://www.geeksforgeeks.org/dsa/elo-rating-algorithm/
  const expectedA = expectedScore(ratingA, ratingB);
  const expectedB = expectedScore(ratingB, ratingA);

  const updateRatingA = Math.round(ratingA + K * (outcome - expectedA));
  const updateRatingB = Math.round(ratingB + K * (1 - outcome - expectedB));

  return { updateRatingA, updateRatingB };
}

// Updates the ELO ratings for two players after a game match completes
export async function updateEloRating(playerAId, playerBId, draw = false) {
  // Fetch both players from the database
  const playerA = await User.findOne({ _id: playerAId });
  const playerB = await User.findOne({ _id: playerBId });

  // Validate both players exist - throws error if either player not found
  if (!playerA || !playerB) {
    throw new Error("ERROR: One or more players was not found");
  }

  const outcome = draw ? 0.5 : 1;

  // Calculate new ELO ratings using the ELO algorithm
  const { updateRatingA, updateRatingB } = eloRating(
    playerA.eloRating,
    playerB.eloRating,
    30, // controls how much a single game affects the rating
    outcome,
  );

  // Update player ratings
  playerA.eloRating = updateRatingA;
  playerB.eloRating = updateRatingB;

  //updated ratings to the database
  await playerA.save();
  await playerB.save();
  return { updateRatingA, updateRatingB };
}
