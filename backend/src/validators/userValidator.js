import { body } from "express-validator";

import {
  MIN_USER_USERNAME_LENGTH,
  MAX_USER_USERNAME_LENGTH,
  MIN_USER_PASSWORD_LENGTH,
  MAX_USER_PASSWORD_LENGTH,
  MIN_USER_AGE_LENGTH,
  MAX_USER_AGE_LENGTH,
  MAX_USER_BIO_LENGTH,
} from "../config/constants.js";

export const validateUser = () => {
  return [
    body("username")
      .trim()
      .isAlphanumeric()
      .withMessage("Username can only contain alpha numeric characters")
      .isLength({
        min: MIN_USER_USERNAME_LENGTH,
        max: MAX_USER_USERNAME_LENGTH,
      })
      .withMessage(
        `Username needs to between ${MIN_USER_USERNAME_LENGTH} and ${MAX_USER_USERNAME_LENGTH} characters long`,
      ), // TODO: Create a function to check if a username is taken
    body("password")
      .trim()
      .isStrongPassword({
        min: MIN_USER_PASSWORD_LENGTH,
        max: MAX_USER_PASSWORD_LENGTH,
        minLowercase: 1,
        minUppercase: 1,
        minNumber: 1,
      })
      .withMessage(
        `Password needs to be between ${MIN_USER_PASSWORD_LENGTH} and ${MAX_USER_PASSWORD_LENGTH} characters long`,
      ),
    body("email").trim().escape().isEmail().withMessage("Not a valid email"), // TODO: create a function to check if mail is in use
    body("age")
      .isInt({
        min: MIN_USER_AGE_LENGTH,
        max: MAX_USER_AGE_LENGTH,
      })
      .withMessage(
        `You need to be between the age of ${MIN_USER_AGE_LENGTH} to ${MAX_USER_AGE_LENGTH} to play this game`,
      )
      .bail()
      .toInt(),
  ];
};

export const validateUpdateUser = () => {
  return [
    body("email")
      .trim()
      .optional()
      .isEmail()
      .withMessage("Must be a valid email"),
    body("password")
      .trim()
      .optional()
      .isStrongPassword({
        min: MIN_USER_PASSWORD_LENGTH,
        max: MAX_USER_PASSWORD_LENGTH,
        minLowercase: 1,
        minUppercase: 1,
        minNumber: 1,
      })
      .withMessage(
        `Password needs to be between ${MIN_USER_PASSWORD_LENGTH} and ${MAX_USER_PASSWORD_LENGTH} characters long`,
      ),
  ];
};

export const validateLogin = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .isEmail()
      .withMessage("A valid email is required"),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ];
};
