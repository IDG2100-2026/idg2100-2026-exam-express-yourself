import { body, query } from "express-validator";
import {
  VALID_ROUNDS,
  VALID_TIME_CONTROLS,
  VALID_PLAYER_COUNTS,
  VALID_BUY_INS,
  MATCH_STATUSES,
} from "../config/constants.js";


// Validates optional query params for filtering the match lobby (GET /api/matches)
export function validateGetMatches() {
  return [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer.")
      .toInt(),
    query("limit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Limit must be a positive integer.")
      .toInt(),
    query("status")
      .optional()
      .isIn(MATCH_STATUSES)
      .withMessage(`Status must be one of: ${MATCH_STATUSES.join(", ")}.`),
    query("playerId")
      .optional()
      .isMongoId()
      .withMessage("Player ID must be a valid ID."),
    query("rounds")
      .optional()
      .toInt()
      .isIn(VALID_ROUNDS)
      .withMessage(`Rounds must be one of: ${VALID_ROUNDS.join(", ")}.`),
    query("timeControl")
      .optional()
      .toInt()
      .isIn(VALID_TIME_CONTROLS)
      .withMessage(
        `Time control must be one of: ${VALID_TIME_CONTROLS.join(", ")}.`,
      ),
    query("straightsAllowed")
      .optional()
      .isBoolean()
      .withMessage("Straights allowed must be true or false.")
      .toBoolean(),
  ];
}


// Validates required and optional body fields when creating a new match (POST /api/matches)
export function validateCreateMatch() {
  return [
    body("rounds")
      .notEmpty()
      .withMessage("Rounds is required.")
      .isIn(VALID_ROUNDS)
      .withMessage(`Rounds must be one of: ${VALID_ROUNDS.join(", ")}.`)
      .toInt(),
    body("timeControl")
      .notEmpty()
      .withMessage("Time control is required.")
      .isIn(VALID_TIME_CONTROLS)
      .withMessage(
        `Time control must be one of: ${VALID_TIME_CONTROLS.join(", ")}.`,
      )
      .toInt(),
    body("straightsAllowed")
      .optional()
      .isBoolean()
      .withMessage("Straights allowed must be true or false.")
      .toBoolean(),
    body("maxPlayers")
      .optional()
      .isIn(VALID_PLAYER_COUNTS)
      .withMessage(
        `Max players must be one of: ${VALID_PLAYER_COUNTS.join(", ")}.`,
      )
      .toInt(),
    body("buyIn")
      .optional()
      .isIn(VALID_BUY_INS)
      .withMessage(`Buy-in must be one of: ${VALID_BUY_INS.join(", ")}.`)
      .toInt(),
  ];
}


// Validates winnerId and score when recording a match result (PATCH /api/matches/:id/result)
export function validateRecordResult() {
  return [
    body("winnerId")
      .notEmpty()
      .withMessage("Winner ID is required.")
      .isMongoId()
      .withMessage("Winner ID must be a valid ID."),
    body("score").notEmpty().withMessage("Score is required."),
  ];
}
