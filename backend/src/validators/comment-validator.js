import { body, query } from "express-validator";
import {
  MIN_COMMENT_LENGTH,
  MAX_COMMENT_LENGTH,
  COMMENT_TARGET_TYPES,
} from "../config/constants.js";


// Validates optional query params for filtering comments (GET /api/comments)
export function validateGetComments() {
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
    query("targetType")
      .optional()
      .isIn(COMMENT_TARGET_TYPES)
      .withMessage(`Target type must be one of: ${COMMENT_TARGET_TYPES.join(", ")}.`),
    query("targetId")
      .optional()
      .isMongoId()
      .withMessage("Target ID must be a valid ID."),
    query("search")
      .optional()
      .trim()
      .isLength({ min: 3 })
      .withMessage("Search term must be at least 3 characters."),
  ];
}


// Validates required body fields when posting a new comment (POST /api/comments)
export function validateCreateComment() {
  return [
    body("text")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Text is required.")
      .isLength({ min: MIN_COMMENT_LENGTH, max: MAX_COMMENT_LENGTH })
      .withMessage(`Text must be between ${MIN_COMMENT_LENGTH} and ${MAX_COMMENT_LENGTH} characters.`),
    body("targetType")
      .notEmpty()
      .withMessage("Target type is required.")
      .isIn(COMMENT_TARGET_TYPES)
      .withMessage(`Target type must be one of: ${COMMENT_TARGET_TYPES.join(", ")}.`),
    body("targetId")
      .notEmpty()
      .withMessage("Target ID is required.")
      .isMongoId()
      .withMessage("Target ID must be a valid ID."),
  ];
}
