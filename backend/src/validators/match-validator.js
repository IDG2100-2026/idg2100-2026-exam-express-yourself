import { body } from "express-validator";

export function validateCreateMatch() {
  return [
    body("rounds")
      .isIn([3, 5, 7])
      .withMessage("Rounds must be 3, 5, or 7")
      .toInt(),
    body("timeControl")
      .isIn([10, 30, 90])
      .withMessage("Time control must be 10, 30, or 90 seconds")
      .toInt(),
    body("straightsAllowed")
      .optional()
      .isBoolean()
      .withMessage("straightsAllowed must be true or false"),
    body("maxPlayers")
      .optional()
      .isIn([2, 3, 5])
      .withMessage("Max players must be 2, 3, or 5")
      .toInt(),
    body("buyIn")
      .optional()
      .isIn([1, 10, 50])
      .withMessage("Buy-in must be 1, 10, or 50")
      .toInt(),
  ];
}
