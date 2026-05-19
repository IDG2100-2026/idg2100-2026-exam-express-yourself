import { body } from "express-validator";
import {
  registeredOrAnonymous,
  isPlayerAvailable,
} from "../services/gameServices.js";
import { checkIfUserIsBanned } from "../services/tournamentService.js";

export function validateCreateGame() {
  return [
    body("players")
      .optional()
      .isArray({ min: 1, max: 2 }) // Can only be 2 players in a game
      .withMessage("A Game can only have two players")
      .custom(registeredOrAnonymous, isPlayerAvailable, checkIfUserIsBanned),
    body("variant.rounds")
      .isIn([3, 5, 7])
      .withMessage("Rounds must be best of 3, 5 or 7")
      .toInt(),

    body("variant.timeControl")
      .isIn([3, 10, 30])
      .withMessage("Time between rounds must be either 5, 10 or 15 seconds")
      .toInt(),
    body("variant.straightAllowed")
      .optional()
      .isBoolean()
      .withMessage(
        "Straight games must be allowed or not. This is optional, but default is that straigh is allowed!",
      ),
  ];
}

export default {
  validateCreateGame,
};
