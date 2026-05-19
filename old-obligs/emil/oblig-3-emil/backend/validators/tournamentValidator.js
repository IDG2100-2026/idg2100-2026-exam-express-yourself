import { param, body } from "express-validator";
import {
  validateDate,
  checkIfUserIsAlreadyEnrolledInATournament,
} from "../services/tournamentService.js";
import {
  MIN_TOURNAMENT_TITLE_LENGTH,
  MAX_TOURNAMENT_TITLE_LENGTH,
  MIN_TOURNAMENT_DESCRIPTION_LENGTH,
  MAX_TOURNAMENT_DESCRIPTION_LENGTH,
} from "../config/constants.js";

export function validateTournamentCreation() {
  return [
    body("title")
      .isString()
      .trim()
      .isLength({
        min: MIN_TOURNAMENT_TITLE_LENGTH,
        max: MAX_TOURNAMENT_TITLE_LENGTH,
      })
      .withMessage(
        `Tournament title must be at least ${MIN_TOURNAMENT_TITLE_LENGTH} characters long, but not longer than ${MAX_TOURNAMENT_TITLE_LENGTH} characters`,
      ),
    body("description")
      .isString()
      .trim()
      .isLength({
        min: MIN_TOURNAMENT_DESCRIPTION_LENGTH,
        max: MAX_TOURNAMENT_DESCRIPTION_LENGTH,
      })
      .withMessage(
        `Tournament description must be at least ${MIN_TOURNAMENT_DESCRIPTION_LENGTH} characters long, but no longer than ${MAX_TOURNAMENT_DESCRIPTION_LENGTH} characters`,
      ),
    body("format.rounds")
      .notEmpty()
      .isIn([3, 5, 7])
      .withMessage("Rounds must be either best of 3, 5 or 7")
      .toInt(),
    body("format.timeControl")
      .notEmpty()
      .isIn([5, 10, 15])
      .withMessage("Time between rounds must be either 5, 10 or 15 seconds")
      .toInt(),
    body("format.straight")
      .optional()
      .isBoolean()
      .withMessage(
        "Straight games must be allowed or not. This is optional, but default is that straigh is allowed!",
      ),
    body("format.breakDuration")
      .notEmpty()
      .withMessage("Choosing break duration is required!")
      .isIn([10, 20, 30])
      .withMessage(
        "Break duration must be either 10, 20 or 30 seconds (time between matches)",
      )
      .toInt(),
    body("startTime")
      .isISO8601() // Only date formatter i could find. Format goes like YYYY-MM-DD
      .withMessage("Start date must be a valid date")
      .custom(validateDate),
    body("trophy.title")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Trophy Title is required!"),
  ];
}

export function validateEnrollment() {
  return [
    param("id")
      .isMongoId() // Checks if the id in the URL is like a 24 character mongoDB id.
      .withMessage("Invalid tournamentID"),
    param("userId")
      .isMongoId()
      .withMessage("Invalid User Id!")
      .custom(checkIfUserIsAlreadyEnrolledInATournament)
      .withMessage("User is already enrolled in an active tournament"),
  ];
}

export function validateUpdateTournament() {
  return [
    param("id").isMongoId().withMessage("Invalid tournament id!"),
    body("title")
      .optional()
      .trim()
      .isString()
      .isLength({
        min: MIN_TOURNAMENT_TITLE_LENGTH,
        max: MAX_TOURNAMENT_TITLE_LENGTH,
      })
      .withMessage(
        `Title must be at least ${MIN_TOURNAMENT_TITLE_LENGTH} characters long, but no longer than ${MAX_TOURNAMENT_TITLE_LENGTH} characters`,
      ),
    body("description")
      .optional()
      .trim()
      .isString()
      .isLength({
        min: MIN_TOURNAMENT_DESCRIPTION_LENGTH,
        max: MAX_TOURNAMENT_DESCRIPTION_LENGTH,
      })
      .withMessage(
        `Description must be at least ${MIN_TOURNAMENT_DESCRIPTION_LENGTH} characters long, but no longer than ${MAX_TOURNAMENT_DESCRIPTION_LENGTH} characters`,
      ),
    body("startTime")
      .optional()
      .isISO8601()
      .withMessage("Date must be a valid date")
      .custom(validateDate),
    body("format.rounds")
      .optional()
      .isIn([3, 5, 7])
      .withMessage("Rounds must be either best of 3, 5 or 7")
      .toInt(),
    body("format.timeControl")
      .optional()
      .isIn([5, 10, 15])
      .withMessage("Time between rounds must be either 5, 10 or 15 seconds")
      .toInt(),
    body("format.straight")
      .optional()
      .isBoolean()
      .withMessage(
        "Straight games must be allowed or not. This is optional, but default is that straigh is allowed!",
      ),
    body("format.breakDuration")
      .optional()
      .isIn([10, 20, 30])
      .withMessage(
        "Break duration must be either 10, 20 or 30 seconds (time between matches)",
      )
      .toInt(),
  ];
}

export default {
  validateTournamentCreation,
  validateEnrollment,
  validateUpdateTournament,
};
