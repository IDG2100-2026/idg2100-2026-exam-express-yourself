import { body, query } from "express-validator";
import User from "../models/User.js";
import {
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
  ALLOWED_USERNAME_FORMAT,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_USER_EMAIL_LENGTH,
  MIN_USER_AGE,
  MAX_USER_AGE,
  MAX_USER_BIO_LENGTH,
  USER_THEMES,
} from "../config/constants.js";
import {
  checkIfEmailExists,
  checkIfUsernameIsAvailable,
} from "../services/user-service.js";

// Validates optional query params when listing all users (GET /api/users)
export function validateGetUsers() {
  return [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive number.")
      .toInt(),
    query("limit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Limit must be a positive number.")
      .toInt(),
    query("search").optional().trim().escape(),
  ];
}

// Validates required body fields when registering a new user (POST /api/auth/register)
export function validateRegister() {
  return [
    body("username")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Username is required.")
      .isLength({ min: MIN_USERNAME_LENGTH, max: MAX_USERNAME_LENGTH })
      .withMessage(
        `Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters.`,
      )
      .matches(ALLOWED_USERNAME_FORMAT)
      .withMessage("Username can only contain letters and numbers.")
      .bail()
      .custom(checkIfUsernameIsAvailable),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required.")
      .isLength({ max: MAX_USER_EMAIL_LENGTH })
      .withMessage(
        `Email cannot be longer than ${MAX_USER_EMAIL_LENGTH} characters.`,
      )
      .isEmail()
      .withMessage("Must be a valid email address, e.g. user@mail.com.")
      .bail()
      .custom(checkIfEmailExists),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
      .isLength({ min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_LENGTH })
      .withMessage(
        `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`,
      )
      .isStrongPassword({
        minLength: MIN_PASSWORD_LENGTH,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.",
      ),
    body("age")
      .notEmpty()
      .withMessage("Age is required.")
      .isInt({ min: MIN_USER_AGE, max: MAX_USER_AGE })
      .withMessage(`Age must be between ${MIN_USER_AGE} and ${MAX_USER_AGE}.`)
      .toInt(),
  ];
}

// Validates required body fields when logging in (POST /api/auth/login)
export function validateLogin() {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Must be a valid email address, e.g. user@mail.com."),
    body("password").trim().notEmpty().withMessage("Password is required."),
  ];
}

// Validates optional body fields when updating a user profile (PATCH /api/users/:id)
export function validateUpdateUser() {
  return [
    body("username")
      .optional()
      .trim()
      .escape()
      .isLength({ min: MIN_USERNAME_LENGTH, max: MAX_USERNAME_LENGTH })
      .withMessage(`Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters.`)
      .matches(ALLOWED_USERNAME_FORMAT)
      .withMessage("Username can only contain letters and numbers.")
      .bail()
      .custom(async (username, { req }) => {
        const exists = await User.findOne({ username, _id: { $ne: req.params.id } });
        if (exists) throw new Error("Username already taken.");
      }),
    body("email")
      .optional()
      .trim()
      .isLength({ max: MAX_USER_EMAIL_LENGTH })
      .withMessage(
        `Email cannot be longer than ${MAX_USER_EMAIL_LENGTH} characters.`,
      )
      .isEmail()
      .withMessage("Must be a valid email address, e.g. user@mail.com."),
    body("oldPassword")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Old password is required."),
    body("password")
      .optional()
      .trim()
      .isLength({ min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_LENGTH })
      .withMessage(
        `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`,
      )
      .isStrongPassword({
        minLength: MIN_PASSWORD_LENGTH,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.",
      ),
    body("bio")
      .optional()
      .trim()
      .escape()
      .isLength({ max: MAX_USER_BIO_LENGTH })
      .withMessage(
        `Bio cannot be longer than ${MAX_USER_BIO_LENGTH} characters.`,
      ),
    body("profileImageUrl")
      .optional()
      .trim()
      .isURL()
      .withMessage("Profile image must be a valid URL."),
    body("appearance.theme")
      .optional()
      .isIn(USER_THEMES)
      .withMessage(`Theme must be one of: ${USER_THEMES.join(", ")}.`),
    body("appearance.boardColor").optional().trim(),
    body("appearance.sound")
      .optional()
      .isBoolean()
      .withMessage("Sound must be true or false."),
    body("appearance.lobbySize")
      .optional()
      .isInt()
      .withMessage("Lobby size must be a number.")
      .toInt(),
  ];
}
