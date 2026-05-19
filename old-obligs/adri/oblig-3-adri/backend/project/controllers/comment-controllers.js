import * as commentServices from "../services/comment-services.js";

export async function createComment(req, res) { //create new comment on a match or tournament
    try {
        const role = req.role;
        if (role === "anonymous") {
            res.status(403);
            res.json({ error: "FORBIDDEN_ACCESS", message: "Restricted access" });
            return;
        }
        const commentData = req.body;
        const newComment = await commentServices.createComment(commentData);
        res.status(201);
        res.json({ message: "Comment created successfully", _id: newComment._id });
    } catch (error) {
        res.status(500);
        res.json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
    }
}

export async function getComments(req, res) { //fetch all comments, filterable by match or tournament
    try {
        const matchId = req.query.matchId;
        const tournamentId = req.query.tournamentId;
        const comments = await commentServices.getComments(matchId, tournamentId);
        res.status(200);
        res.json(comments);
    } catch (error) {
        res.status(500);
        res.json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
    }
}

export async function deleteComment(req, res) { //delete one comment by id, requires admin
    try {
        const role = req.role;
        if (role !== "admin") {
            res.status(403);
            res.json({ error: "FORBIDDEN_ACCESS", message: "Restricted access" });
            return;
        }
        const id = req.params.id;
        await commentServices.deleteComment(id);
        res.status(200);
        res.json({ message: "Comment deleted successfully" });
    } catch (error) {
        if (error.message === "NOT_FOUND") {
            res.status(404);
            res.json({ error: "NOT_FOUND", message: "Comment not found" });
        } else {
            res.status(500);
            res.json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
        }
    }
}

export default {
    createComment,
    getComments,
    deleteComment
};
