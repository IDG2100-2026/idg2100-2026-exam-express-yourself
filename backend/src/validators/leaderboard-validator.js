import { query } from "express-validator";
import { VALID_ROUNDS, VALID_TIME_CONTROLS, LEADERBOARD_SORT_OPTIONS } from "../config/constants.js";


// Validates optional query params for filtering the leaderboard (GET /api/leaderboard)
export function validateGetLeaderboard() {
  return [
    query("rounds")
      .optional()
      .toInt()
      .isIn(VALID_ROUNDS)
      .withMessage(`Rounds must be one of: ${VALID_ROUNDS.join(", ")}.`),
    query("timeControl")
      .optional()
      .toInt()
      .isIn(VALID_TIME_CONTROLS)
      .withMessage(`Time control must be one of: ${VALID_TIME_CONTROLS.join(", ")}.`),
    query("straightsAllowed")
      .optional()
      .isBoolean()
      .withMessage("Straights allowed must be true or false.")
      .toBoolean(),
    query("sortBy")
      .optional()
      .isIn(LEADERBOARD_SORT_OPTIONS)
      .withMessage(`Sort by must be one of: ${LEADERBOARD_SORT_OPTIONS.join(", ")}.`),
  ];
}
