import express from "express";
import { requireUser } from "../middlewares/authMiddleware.js";
import { validateCreateMatch } from "../validators/matchValidator.js";
import { validate } from "../validators/validate.js";
import {
  getAllMatches,
  getMatch,
  createMatch,
  joinMatch,
  leaveMatch,
  recordResult,
} from "../controllers/matchController.js";

const matchRouter = express.Router();

matchRouter.get("/", getAllMatches);
matchRouter.get("/:id", getMatch);
matchRouter.post("/", validateCreateMatch(), validate, createMatch);
matchRouter.post("/:id/join", requireUser, joinMatch);
matchRouter.post("/:id/leave", requireUser, leaveMatch);
matchRouter.patch("/:id/result", recordResult);

export default matchRouter;
