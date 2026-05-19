import express from "express";
import * as trophyControllers from "../controllers/trophy-controllers.js"

const router = express.Router();

router.post("/", trophyControllers.createTrophy); //POST /trophies create new trophy
router.get("/:id", trophyControllers.getTrophy); //GET /trophies/:id fetch one trophy by id

export default router;