import express from "express";
import { validateCreateMatch } from "../validators/match-validator.js";
import { validate } from "../validators/validate.js";
import {
  getAllMatches,
  getMatch,
  createMatch,
  joinMatch,
  leaveMatch,
  recordResult,
} from "../controllers/match-controller.js";
import { authenticate, authorize } from "../middlewares/auth-middleware.js";
const matchRouter = express.Router();

// public routes
matchRouter.get("/", getAllMatches);
matchRouter.get("/:id", getMatch);

matchRouter.use(authenticate);

matchRouter.post("/", authorize("user"), validateCreateMatch(), validate, createMatch); // create a game
matchRouter.post("/:id/join", authorize("user"), joinMatch); // join a game
matchRouter.post("/:id/leave", authorize("user"), leaveMatch); // leave a game
matchRouter.patch("/:id/result", authorize("user", "admin"), recordResult); // 

export default matchRouter;
