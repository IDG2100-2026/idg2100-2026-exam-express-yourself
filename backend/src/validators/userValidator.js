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
      .isLength({ min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_LENGTH })
      .withMessage(
        `Password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters`,
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
      .isLength({ min: MIN_PASSWORD_LENGTH })
      .withMessage(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      ),
    body("bio").optional().isString(),
  ];
}
