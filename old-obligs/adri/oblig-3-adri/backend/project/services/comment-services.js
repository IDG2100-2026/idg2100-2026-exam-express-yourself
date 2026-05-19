import Comment from "../models/Comment.js";

export async function createComment(commentData) { //create and save new comment to db
    const newComment = new Comment(commentData);
    return newComment.save();
}

export async function getComments(matchId, tournamentId) { //fetch all comments, optional filter
    if (matchId) {
        return Comment.find({ matchId: matchId }).populate("author", "username"); //populate author so we get username not just id
    }
    if (tournamentId) {
        return Comment.find({ tournamentId: tournamentId }); //filter by tournament if id provided
    }
    return Comment.find(); //return all comments if no filter provided
}

export async function deleteComment(id) { //find comment by id and delete from db
    const comment = await Comment.findById(id);
    if (!comment) {
        throw new Error("NOT_FOUND");
    }
    return comment.deleteOne();
}
