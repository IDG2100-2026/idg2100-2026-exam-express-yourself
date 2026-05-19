import express from "express";
import gameController from "../controllers/gameController.js";
import { validate } from "../validators/validate.js";
import { validateCreateGame } from "../validators/gameValidator.js";
import commentController from "../controllers/commentController.js";
import { userRequire } from "../middleware/user.auth.js";
import { commentRateLimiter } from "../middleware/commentRateLimiter.js";
const gameRoute = express.Router();

gameRoute.get("/games", gameController.getGames);
gameRoute.get("/games/:id", validate, gameController.getAGame);
gameRoute.post("/games", validateCreateGame(), validate, gameController.createAGame);
gameRoute.put("/games/:id", validate, gameController.updateGame);

gameRoute.post(
  "/games/:id/comments",
  userRequire,
  commentRateLimiter,
  validate,
  commentController.addGameComment,
);


gameRoute.post("/games/:id/join", gameController.joinAGame);
export default gameRoute;
