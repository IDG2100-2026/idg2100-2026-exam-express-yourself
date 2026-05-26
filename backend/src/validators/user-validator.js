import { body } from "express-validator";
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
} from "../config/constants.js";

export function validateRegister() {
  return [
    body("username")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Username is required.")
      .isLength({ min: MIN_USERNAME_LENGTH, max: MAX_USERNAME_LENGTH })
      .withMessage(`Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters.`)
      .matches(ALLOWED_USERNAME_FORMAT)
      .withMessage("Username can only contain letters and numbers.")
      .bail()
      .custom(async (username) => {
        const exists = await User.findOne({ username });
        if (exists) throw new Error("Username already taken.");
      }),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required.")
      .isLength({ max: MAX_USER_EMAIL_LENGTH })
      .withMessage(`Email cannot be longer than ${MAX_USER_EMAIL_LENGTH} characters.`)
      .isEmail()
      .withMessage("Must be a valid email address, e.g. user@mail.com.")
      .bail()
      .custom(async (email) => {
        const exists = await User.findOne({ email: email.toLowerCase() });
        if (exists) throw new Error("Email already in use.");
      }),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
      .isLength({ min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_LENGTH })
      .withMessage(`Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`)
      .isStrongPassword({
        minLength: MIN_PASSWORD_LENGTH,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."),
    body("age")
      .notEmpty()
      .withMessage("Age is required.")
      .isInt({ min: MIN_USER_AGE, max: MAX_USER_AGE })
      .withMessage(`Age must be between ${MIN_USER_AGE} and ${MAX_USER_AGE}.`)
      .toInt(),
  ];
}

export function validateLogin() {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Must be a valid email address, e.g. user@mail.com."),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ];
}

export function validateUpdateUser() {
  return [
    body("email")
      .optional()
      .trim()
      .isLength({ max: MAX_USER_EMAIL_LENGTH })
      .withMessage(`Email cannot be longer than ${MAX_USER_EMAIL_LENGTH} characters.`)
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
      .withMessage(`Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`)
      .isStrongPassword({
        minLength: MIN_PASSWORD_LENGTH,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."),
    body("bio")
      .optional()
      .trim()
      .escape()
      .isLength({ max: MAX_USER_BIO_LENGTH })
      .withMessage(`Bio cannot be longer than ${MAX_USER_BIO_LENGTH} characters.`),
    body("profileImageUrl")
      .optional()
      .trim()
      .isURL()
      .withMessage("Profile image must be a valid URL."),
    body("appearance.theme")
      .optional()
      .isIn(["light", "dark"])
      .withMessage("Theme must be either light or dark."),
    body("appearance.boardColor")
      .optional()
      .trim(),
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
