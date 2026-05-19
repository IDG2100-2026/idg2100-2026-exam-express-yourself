import { body } from "express-validator";

export function validateLogin() {
  return [
    body("email")
      .trim()
      .notEmpty()
      .isEmail()
      .withMessage("A valid email is required"),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ];
}

export default {
  validateLogin,
};
