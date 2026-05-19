import { useState } from "react";
import { useGame } from "../../hooks/useGame.js";
import { createComment } from "../../services/createComment.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useParams } from "react-router";
import styles from "./IndividualGame.module.css";

export default function GamePage() {
  const { id } = useParams();
  const { game, error, isLoading } = useGame(id);
  const { user } = useAuth();
  const [ gameComment, setGameComment] = useState("");
  const [commentError, setCommentError] = useState(null);

  if (isLoading) return <p>Game is loading...</p>;
  if (error) return <p>{error}</p>;
  if (!game || !game.variant || !game.players) return <p>Loading game...</p>;




  const isWaiting = game.players?.length < 2;
  const isAnonymousGame = game.isAnonymous;

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentError(null);
    if (!user) {
      setCommentError("You must be logged in to post a comment.");
      return;
    }
    try {
      await createComment(id, user.id, gameComment);
      setGameComment("");
    } catch (err) {
      setCommentError(err.message);
    }
  };

  return (
    <section className={styles.gamePageWrapper}>
      <div className={styles.gamePageDisplay}>
        {isWaiting && (
          <div className={styles.gamePageOverlay}>
            <p>Waiting for players</p>
            <p>Page will refresh every 15 seconds to find a player</p>
          </div>
        )}
        <div className={styles.gamePageDisplayContent}>
          <h1>Game Details</h1>

          <span>
            Best of rounds:{" "}
            <span className={styles.styleBold}>{game?.variant?.rounds}</span> |
            Seconds per round:{" "}
            <span className={styles.styleBold}>
              {game?.variant?.timeControl}
            </span>{" "}
            | Straight hand is allowed:{" "}
            <span className={styles.styleBold}>
              {game?.variant?.straightAllowed ? "Yes" : "No"}{" "}
            </span>
          </span>
          <p>
            Here activity from when the game is ongoing, will be posted! Like
            for example, display the players holds, and what they rolled.{" "}
          </p>
        </div>
      </div>

      <div className={styles.firstPlayerGameBoardWrapper}>
        <div className={styles.firstPlayerGameBoardContainer}>
          <span>Name: {game.players[0]?.userId?.username || "Anonymous"}</span>
          <span>Elo rating: {game.players[0]?.userId?.eloRating}</span>
          <div className={styles.gameBoard}>
            <p>Here is where the game dices go!</p>
          </div>
        </div>
      </div>
      <div className={styles.secondPlayerGameBoardWrapper}>
        <div className={styles.secondPlayerGameBoardContainer}>
          <span>Name: {game.players[1]?.userId?.username || "Anonymous"}</span>
          <span>Elo rating: {game.players[1]?.userId?.eloRating}</span>
          <div className={styles.gameBoard}>
            <p>Here is where the game dices go!</p>
          </div>
        </div>
      </div>

      <section className={styles.gamePageCommentWrapper}>
        <div className={styles.gamePageCommentContainer}>
          <div className={styles.commentList}>
            {game.comments?.length > 0 ? (
              game.comments.map((comment, index) => (
                <div key={index}>
                  <p>{comment.comment}</p>
                </div>
              ))
            ) : (
              <p>No comments yet</p>
            )}
          </div>
          <div className={styles.commentInput}>
            <form className={styles.gamePageCommentForm} onSubmit={handleCommentSubmit}>
              <textarea
                className={styles.gamePageTextArea}
                value={gameComment}
                onChange={(e) => setGameComment(e.target.value)}
                placeholder="Leave a comment..."
                required
                maxLength="200"
              />
              <button>Post a comment</button>
              {commentError && <p>{commentError}</p>}
            </form>
          </div>
        </div>
      </section>
    </section>
  );
}
