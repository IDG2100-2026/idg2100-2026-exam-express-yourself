import commentService from "../services/commentService.js";
import { Game } from "../models/game.js";
import { Tournament } from "../models/tournament.js";

// Posting comments on a game!
export async function addGameComment(req, res) {
  try {
    const { id } = req.params;
    const { userId, comment } = req.body;

    const game = await Game.findOne({ _id: id });
    if (!game) {
      return res.status(404).json({ Error: "Game was not found" });
    }

    const newComment = await commentService.createComment(
      userId,
      comment,
      "Game",
      id,
    );

    game.comments.push(newComment._id);
    await game.save();

    return res.status(201).json({ Message: `Comment added: ${newComment}` });
  } catch (err) {
    return res.status(500).json({ Error: err.message });
  }
}

// Posting comments on a tournament
export async function addTournamentComment(req, res) {
  try {
    const { id } = req.params;
    const { userId, comment } = req.body;

    const tournament = await Tournament.findOne({ _id: id });
    if (!tournament) {
      return res.status(404).json({ Error: "Tournament was not found!" });
    }

    const newComment = await commentService.createComment(
      userId,
      comment,
      "Tournament",
      id,
    );

    tournament.comments.push(newComment._id);
    await tournament.save();

    return res.status(201).json({ Message: `Comment added: ${newComment}` });
  } catch (err) {
    return res.status(500).json({ Error: err.message });
  }
}

export async function getAllComments(req, res) {
  try {
    const comments = await commentService.getAllComments();
    return res.status(200).json(comments);
  } catch (err) {
    return res.status(500).json({ Error: err.message });
  }
}

export async function deleteComment(req, res) {
  try {
    const { id } = req.params;

    const deleted = await commentService.deleteComment(id);

    if (!deleted) {
      return res.status(404).json({ Error: "Comment was not found! " });
    }

    return res.status(200).json({ Message: "Comment was deleted!" });
  } catch (err) {
    return res.status(500).json({ Error: err.message });
  }
}

export default {
  addGameComment,
  addTournamentComment,
  getAllComments,
  deleteComment,
};
