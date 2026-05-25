import { body } from "express-validator";
import User from "../models/User.js";
import {
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_USER_AGE,
  MAX_USER_AGE,
} from "../config/constants.js";

export function validateRegister() {
  return [
    body("username")
      .trim()
      .isAlphanumeric()
      .withMessage("Username can only contain letters and numbers")
      .isLength({ min: MIN_USERNAME_LENGTH, max: MAX_USERNAME_LENGTH })
      .withMessage(
        `Username must be ${MIN_USERNAME_LENGTH}-${MAX_USERNAME_LENGTH} characters`,
      )
      .bail()
      .custom(async (username) => {
        const exists = await User.findOne({ username });
        if (exists) throw new Error("Username already taken");
      }),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Must be a valid email")
      .bail()
      .custom(async (email) => {
        const exists = await User.findOne({ email: email.toLowerCase() });
        if (exists) throw new Error("Email already in use");
      }),
    body("password")
      .trim()
      .isStrongPassword({
        min: MIN_PASSWORD_LENGTH,
        max: MAX_PASSWORD_LENGTH,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        `Password needs to be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters long and contain 1 of each lower and upper case characters, and minimum 1 special character`,
      ),
    body("age")
      .isInt({ min: MIN_USER_AGE, max: MAX_USER_AGE })
      .withMessage(
        `You must be between the age of ${MIN_USER_AGE} to ${MAX_USER_AGE} years old to play this`,
      )
      .toInt(),
  ];
}

export function validateLogin() {
  return [
    body("email")
      .trim()
      .notEmpty()
      .isEmail()
      .withMessage("Valid email required"),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ];
}

export function validateUpdateUser() {
  return [
    body("email").optional().isEmail().withMessage("Must be a valid email"),
    body("password")
      .optional()
      .trim()
      .isStrongPassword({
        min: MIN_PASSWORD_LENGTH,
        max: MAX_PASSWORD_LENGTH,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        `Password needs to be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters long and contain 1 of each lower and upper case characters, and minimum 1 special character`,
      ),
    body("bio").optional().isString(),
  ];
}
