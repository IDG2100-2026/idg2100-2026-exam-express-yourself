import { body } from "express-validator";
import {
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
} from "../config/constants.js";

export const validatePasswordReset = () => {
  return [
    body("newPassword")
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
        `New password needs to be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters long and contain 1 of each lower and upper case characters, and minimum 1 special character`,
      ),
  ];
};

export const validateForgotPassword = () => {
  return [
    body("email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .withMessage("Must be a valid email"),
  ];
};
