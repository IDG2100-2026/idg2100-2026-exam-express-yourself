import { body, query } from "express-validator";
import {
  MIN_TOURNAMENT_TITLE_LENGTH,
  MAX_TOURNAMENT_TITLE_LENGTH,
  MIN_TOURNAMENT_DESCRIPTION_LENGTH,
  MAX_TOURNAMENT_DESCRIPTION_LENGTH,
  MIN_TOURNAMENT_BUY_IN,
  TOURNAMENT_STATUSES,
  VALID_ROUNDS,
  VALID_TIME_CONTROLS,
  VALID_BUY_INS,
} from "../config/constants.js";


// Validates optional query params for browsing tournaments (GET /api/tournaments)
export function validateGetTournaments() {
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
      .isIn(TOURNAMENT_STATUSES)
      .withMessage(`Status must be one of: ${TOURNAMENT_STATUSES.join(", ")}.`),
    query("search")
      .optional()
      .trim()
      .isLength({ min: 3 })
      .withMessage("Search term must be at least 3 characters."),
    query("sort")
      .optional()
      .isIn(["date", "title", "players"])
      .withMessage("Sort must be one of: date, title, players."),
  ];
}


// Validates body when creating a new tournament (POST /api/tournaments)
export function validateCreateTournament() {
  return [
    body("title")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Title is required.")
      .isLength({ min: MIN_TOURNAMENT_TITLE_LENGTH, max: MAX_TOURNAMENT_TITLE_LENGTH })
      .withMessage(`Title must be between ${MIN_TOURNAMENT_TITLE_LENGTH} and ${MAX_TOURNAMENT_TITLE_LENGTH} characters.`),
    body("description")
      .optional()
      .trim()
      .escape()
      .isLength({ min: MIN_TOURNAMENT_DESCRIPTION_LENGTH, max: MAX_TOURNAMENT_DESCRIPTION_LENGTH })
      .withMessage(`Description must be between ${MIN_TOURNAMENT_DESCRIPTION_LENGTH} and ${MAX_TOURNAMENT_DESCRIPTION_LENGTH} characters.`),
    body("startDate")
      .trim()
      .notEmpty()
      .withMessage("Start date is required.")
      .isISO8601()
      .withMessage("Start date must be a valid date.")
      .custom(function(value) {
        if (new Date(value) <= new Date()) {
          throw new Error("Start date must be in the future.");
        }
        return true;
      }),
    body("numberOfRounds")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Number of rounds must be a positive integer.")
      .toInt(),
    body("category.rounds")
      .notEmpty()
      .withMessage("Category rounds is required.")
      .toInt()
      .isIn(VALID_ROUNDS)
      .withMessage(`Rounds must be one of: ${VALID_ROUNDS.join(", ")}.`),
    body("category.timeControl")
      .notEmpty()
      .withMessage("Category time control is required.")
      .toInt()
      .isIn(VALID_TIME_CONTROLS)
      .withMessage(`Time control must be one of: ${VALID_TIME_CONTROLS.join(", ")}.`),
    body("category.straightsAllowed")
      .optional()
      .isBoolean()
      .withMessage("Straights allowed must be true or false.")
      .toBoolean(),
    body("category.buyIn")
      .optional()
      .toInt()
      .isIn(VALID_BUY_INS)
      .withMessage(`Category buy-in must be one of: ${VALID_BUY_INS.join(", ")}.`),
    body("buyIn")
      .optional()
      .isInt({ min: MIN_TOURNAMENT_BUY_IN })
      .withMessage(`Buy-in cannot be lower than ${MIN_TOURNAMENT_BUY_IN}.`)
      .toInt(),
    body("eloRange.min")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Elo range minimum must be a non-negative integer.")
      .toInt(),
    body("eloRange.max")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Elo range maximum must be a non-negative integer.")
      .toInt(),
    body("trophyTitle")
      .optional()
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Trophy title cannot be empty."),
  ];
}


// Validates body when updating tournament details (PUT /api/tournaments/:id)
export function validateUpdateTournament() {
  return [
    body("title")
      .optional()
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Title cannot be empty.")
      .isLength({ min: MIN_TOURNAMENT_TITLE_LENGTH, max: MAX_TOURNAMENT_TITLE_LENGTH })
      .withMessage(`Title must be between ${MIN_TOURNAMENT_TITLE_LENGTH} and ${MAX_TOURNAMENT_TITLE_LENGTH} characters.`),
    body("description")
      .optional()
      .trim()
      .escape()
      .isLength({ min: MIN_TOURNAMENT_DESCRIPTION_LENGTH, max: MAX_TOURNAMENT_DESCRIPTION_LENGTH })
      .withMessage(`Description must be between ${MIN_TOURNAMENT_DESCRIPTION_LENGTH} and ${MAX_TOURNAMENT_DESCRIPTION_LENGTH} characters.`),
    body("startDate")
      .optional()
      .trim()
      .isISO8601()
      .withMessage("Start date must be a valid date.")
      .custom(function(value) {
        if (new Date(value) <= new Date()) {
          throw new Error("Start date must be in the future.");
        }
        return true;
      }),
    body("numberOfRounds")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Number of rounds must be a positive integer.")
      .toInt(),
    body("category.rounds")
      .optional()
      .isIn(VALID_ROUNDS)
      .withMessage(`Rounds must be one of: ${VALID_ROUNDS.join(", ")}.`)
      .toInt(),
    body("category.timeControl")
      .optional()
      .isIn(VALID_TIME_CONTROLS)
      .withMessage(`Time control must be one of: ${VALID_TIME_CONTROLS.join(", ")}.`)
      .toInt(),
    body("category.straightsAllowed")
      .optional()
      .isBoolean()
      .withMessage("Straights allowed must be true or false.")
      .toBoolean(),
    body("category.buyIn")
      .optional()
      .toInt()
      .isIn(VALID_BUY_INS)
      .withMessage(`Category buy-in must be one of: ${VALID_BUY_INS.join(", ")}.`),
    body("buyIn")
      .optional()
      .isInt({ min: MIN_TOURNAMENT_BUY_IN })
      .withMessage(`Buy-in cannot be lower than ${MIN_TOURNAMENT_BUY_IN}.`)
      .toInt(),
    body("eloRange.min")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Elo range minimum must be a non-negative integer.")
      .toInt(),
    body("eloRange.max")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Elo range maximum must be a non-negative integer.")
      .toInt(),
    body("trophyTitle")
      .optional()
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Trophy title cannot be empty."),
  ];
}


// Validates body when reporting a tournament match result (PUT /api/tournaments/:id/matches/:matchId/result)
export function validateReportMatchResult() {
  return [
    body("winnerId")
      .notEmpty()
      .withMessage("Winner ID is required.")
      .isMongoId()
      .withMessage("Winner ID must be a valid ID."),
  ];
}
