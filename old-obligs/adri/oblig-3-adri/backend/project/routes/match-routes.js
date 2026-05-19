import express from "express";
import * as matchControllers from "../controllers/match-controllers.js";

const router = express.Router();

router.post("/", matchControllers.createMatch); //POST /matches creates a match
router.get("/", matchControllers.getMatches); //GET /matches fetch list of all matches
router.get("/:id", matchControllers.getMatch); //GET /matches/:id fetch one match by id
router.patch("/:id", matchControllers.updateMatch); //PATCH /matches/:id update a match with results
router.delete("/:id", matchControllers.deleteMatch); //DELETE /matches/:id delete match by id

export default router;