import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useAuth } from "../../hooks/useAuth.js";
import { useAppearance } from "../../hooks/useAppearance.js";
import { useMatch } from "../../hooks/useMatch.js";
import { useComments } from "../../hooks/useComments.js";
import { updateMatch } from "../../services/matches-service.js";
import { createComment } from "../../services/comments-service.js";
import styles from "./IndividualGame.module.css";

export default function IndividualGame() {
    const params = useParams();
    const id = params.id; //the match id from the url, e.g. /game/abc123

    const auth = useAuth();
    const user = auth.user; //the logged in user, null if anonymous

    const appearanceResult = useAppearance();
    const appearance = appearanceResult.appearance;

    const matchResult = useMatch(id);
    const match = matchResult.match;
    const matchIfLoading = matchResult.ifLoading;
    const matchError = matchResult.error;

    const commentsResult = useComments(id);
    const comments = commentsResult.comments;
    const refetch = commentsResult.refetch;

    const [commentText, setCommentText] = useState("");
    const [commentError, setCommentError] = useState(null);

    useEffect(() => { //auto join when navigating to a waiting game from the lobby
        if (!match) {
            return;
        }
        if (match.status !== "waiting") {
            return; //game already started or finished
        }
        if (match.playerTwo) {
            return; //game already has two players
        }
        if (user && match.playerOne && user._id !== match.playerOne._id) {
            updateMatch(id, {
                playerTwo: user._id, //set logged in user as player two
                status: "active"
            });
            return;
        }
        if (!user && match.allowAnonymous) {
            updateMatch(id, {
                status: "active" //anonymous join, playerTwo stays null
            });
            return;
        }
    }, [match, user, id]);

    async function commentSubmitHandler(e) {
        e.preventDefault();
        try {
            await createComment({
                author: user._id,
                content: commentText,
                matchId: id
            });
            setCommentText(""); //clear input after posting
            refetch(); //reload comments so new one appears
        } catch (err) {
            setCommentError(err.message);
        }
    }

    if (matchIfLoading) {
        return (<p>Loading...</p>);
    }
    if (matchError) {
        return (<p>Error: {matchError.toString()}</p>);
    }
    if (!match) {
        return (<p>Match not found</p>);
    }

    const commentItems = [];
    for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        commentItems.push(
            <li key={comment._id}>
                <p>{comment.author.username}</p>
                <p>{new Date(comment.createdAt).toLocaleString()}</p>
                <p>{comment.content}</p>
            </li>
        );
    }

    return(
        <div className={styles["individual-game"]}>
            <h1>Individual game</h1>
            <div className={styles["individual-game__board"]}>
                <div className={styles["individual-game__info"]}>
                    <h2>Game info</h2>
                    <p>{match.playerOne.username} ({match.playerOne.elo} elo)</p>
                    <p>vs</p>
                    <p>
                        {match.playerTwo ? `${match.playerTwo.username} (${match.playerTwo.elo} elo)` : match.status === "active" ? "Anonymous player" : "Waiting for player..."}
                    </p>
                    <p>Best of: {match.bestOf}</p>
                    <p>Straights: {match.straightsAllowed ? "yes" : "no"}</p>
                    <p>Time per round: {match.timeControl} seconds</p>
                    <p>Anonymous allowed: {match.allowAnonymous ? "yes" : "no"}</p>
                </div>
                <div
                    className={styles["individual-game__game-area"]}
                    style={{ "--board-color": appearance.boardColor }} //board color from appearance customizer, applied via css variable
                >
                    <h2>Game area</h2>
                    {match.status === "waiting" ? (
                        <p>Waiting for player...</p>
                    ) : (
                        <p>Game area not implemented</p>
                    )}
                </div>
            </div>
            <div className={styles["individual-game__comments"]}>
                <h2>Comments</h2>
                <ul>
                    {commentItems}
                </ul>
                {user ? (
                    <form onSubmit={commentSubmitHandler}>
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => {
                                setCommentText(e.target.value);
                            }}
                        />
                        <button type="submit">Post comment</button>
                    </form>
                ) : (
                    null
                )}
                {commentError ? (
                    <p>{commentError}</p>
                ) : (
                    null
                )}
            </div>
        </div>
    );
}
