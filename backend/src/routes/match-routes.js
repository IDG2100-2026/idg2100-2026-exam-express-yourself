import express from "express";
import { validateGetMatches, validateCreateMatch, validateRecordResult } from "../validators/match-validator.js";
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
matchRouter.get("/", validateGetMatches(), validate, getAllMatches); // get all matches (lobby)
matchRouter.get("/:id", getMatch); // get a single match

matchRouter.use(authenticate);

matchRouter.post("/", authorize("user"), validateCreateMatch(), validate, createMatch); // create a match
matchRouter.post("/:id/join", authorize("user"), joinMatch); // join a match
matchRouter.post("/:id/leave", authorize("user"), leaveMatch); // leave a match
matchRouter.patch("/:id/result", authorize("user", "admin"), validateRecordResult(), validate, recordResult); // record result

export default matchRouter;
