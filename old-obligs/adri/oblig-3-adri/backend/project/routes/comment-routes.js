import express from "express";
import * as commentControllers from "../controllers/comment-controllers.js";

const router = express.Router();

router.post("/", commentControllers.createComment); //POST /comments create new comment on match or tournament
router.get("/", commentControllers.getComments); //GET /comments fetch all comments, can be filtered by match or tournament
router.delete("/:id", commentControllers.deleteComment); //DELETE /comments/:id delete a comment by id

export default router;