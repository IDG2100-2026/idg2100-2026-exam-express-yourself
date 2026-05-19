import { body } from "express-validator";
import {
  checkIfUsernameExists,
  checkIfEmailExists,
} from "../services/userServices.js";

import {
  MIN_USER_USERNAME_LENGTH,
  MAX_USER_USERNAME_LENGTH,
  MIN_USER_PWD_LENGTH,
  MAX_USER_PWD_LENGTH,
  MIN_USER_AGE_LENGTH,
} from "../config/constants.js";

export function validateUser() {
  return [
    body("username")
      .trim()
      .escape()
      .isAlphanumeric()
      .withMessage("Username can only contain Alphanumeric characters.")
      .isLength({
        min: MIN_USER_USERNAME_LENGTH,
        max: MAX_USER_USERNAME_LENGTH,
      })
      .withMessage(
        `Username must be at least ${MIN_USER_USERNAME_LENGTH} characters long, but not longer than ${MAX_USER_USERNAME_LENGTH} characters`,
      )
      .bail()
      .custom(async (username) => {
        const exists = await checkIfUsernameExists(username);
        if (exists) {
          throw new Error("This username already exists! Please choose another one!");
        }
      }),
    body("pwd")
      .trim()
      .isStrongPassword({
        min: MIN_USER_PWD_LENGTH,
        max: MAX_USER_PWD_LENGTH,
        minLowercase: 1,
        minUppercase: 1,
        minNumber: 1,
      })
      .withMessage(
        `Password should be ${MIN_USER_PWD_LENGTH} + characters long and contain 1 of each lower and upper case characters, and minimum 1 special character`,
      ),
    body("email")
      .escape()
      .trim()
      .isEmail()
      .withMessage("Not a valid email")
      .bail()
      .custom(async (email) => {
        const exists = await checkIfEmailExists(email);
        if (exists) {
          throw new Error("Email is already in use");
        }
      }),
    body("age")
      .isInt({ min: MIN_USER_AGE_LENGTH })
      .withMessage(
        `You need to be ${MIN_USER_AGE_LENGTH} or older to play this!`,
      )
      .bail()
      .toInt(),
  ];
}

export function validateUpdateUser() {
  return [
    body("email").optional().isEmail().withMessage("Must be a valid email!"),
    body("pwd")
      .optional()
      .isLength({ min: MIN_USER_PWD_LENGTH, max: MAX_USER_PWD_LENGTH })
      .withMessage(
        `Password needs to be at least ${MIN_USER_PWD_LENGTH} characters long, but not longer than ${MAX_USER_PWD_LENGTH} characters`,
      ),
    body("age")
      .optional()
      .isInt({ min: MIN_USER_AGE_LENGTH })
      .withMessage(
        `You need to be at least ${MIN_USER_AGE_LENGTH} years old to use this! `,
      ),
  ];
}

export default {
  validateUser,
  validateUpdateUser,
};
