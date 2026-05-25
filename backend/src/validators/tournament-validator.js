import { param, body } from "express-validator";
import {
  MIN_TOURNAMENT_TITLE_LENGTH,
  MAX_TOURNAMENT_TITLE_LENGTH,
  MIN_TOURNAMENT_DESCRIPTION_LENGTH,
  MAX_TOURNAMENT_DESCRIPTION_LENGTH,
} from "../config/constants.js";

export function validateCreateTournament() {
  return [
    body("title")
      .isString()
      .trim()
      .isLength({
        min: MIN_TOURNAMENT_TITLE_LENGTH,
        max: MAX_TOURNAMENT_TITLE_LENGTH,
      })
      .withMessage(
        `Title must be ${MIN_TOURNAMENT_TITLE_LENGTH}-${MAX_TOURNAMENT_TITLE_LENGTH} characters`
      ),
    body("description")
      .optional()
      .isString()
      .trim()
      .isLength({ max: MAX_TOURNAMENT_DESCRIPTION_LENGTH })
      .withMessage(
        `Description cannot exceed ${MAX_TOURNAMENT_DESCRIPTION_LENGTH} characters`
      ),
    body("category.rounds")
      .isIn([3, 5, 7])
      .withMessage("Rounds must be 3, 5, or 7")
      .toInt(),
    body("category.timeControl")
      .isIn([10, 30, 90])
      .withMessage("Time control must be 10, 30, or 90 seconds")
      .toInt(),
    body("category.straightsAllowed")
      .optional()
      .isBoolean()
      .withMessage("straightsAllowed must be true or false"),
    body("startDate")
      .isISO8601()
      .withMessage("Start date must be a valid date")
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error("Start date must be in the future");
        }
        return true;
      }),
    body("trophyTitle")
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Trophy title cannot be empty"),
  ];
}

export function validateUpdateTournament() {
  return [
    param("id").isMongoId().withMessage("Invalid tournament ID"),
    body("title")
      .optional()
      .trim()
      .isString()
      .isLength({
        min: MIN_TOURNAMENT_TITLE_LENGTH,
        max: MAX_TOURNAMENT_TITLE_LENGTH,
      }),
    body("description")
      .optional()
      .trim()
      .isString()
      .isLength({ max: MAX_TOURNAMENT_DESCRIPTION_LENGTH }),
    body("startDate")
      .optional()
      .isISO8601()
      .withMessage("Date must be a valid date"),
  ];
}
