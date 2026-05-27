import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMatch } from "../../hooks/useMatch.js";
import { useComments } from "../../hooks/useComments.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useAppearance } from "../../hooks/useAppearance.js";
import { createComment } from "../../services/comments-service.js";
import GameBoard from "../../components/game-board/GameBoard.jsx";
import Avatar from "../../components/avatar/Avatar.jsx";

export default function Game() {
  const { id } = useParams();
  const { user } = useAuth();
  const { appearance } = useAppearance();
  const { match, isLoading, error, refetch: refetchMatch } = useMatch(id);
  const { comments, refetch: refetch } = useComments("Match", id);

  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState(null);

  async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentError(null);
    try {
      await createComment(commentText, "Match", id);
      setCommentText("");
      refetch();
    } catch (err) {
      setCommentError(err.message);
    }
  }

  if (isLoading) return <p className="game__status">Loading game...</p>;
  if (error) return <p className="game__error">Error: {error}</p>;
  if (!match) return <p className="game__error">Match not found</p>;

  const p1 = match.players?.[0]?.userId;
  const p2 = match.players?.[1]?.userId;

  return (
    <div className="game">
      <div className="game__layout">
        <div className="game__board">
          {match.status === "waiting" && (
            <div className="game__waiting">
              <p>Waiting for another player to join...</p>
              <small>This page refreshes every 15 seconds</small>
            </div>
          )}
          <div className="game__players">
            <div className="game__player">
              <Avatar imageUrl={p1?.profileImageUrl} size={56} />
<<<<<<< HEAD
              <span className="game__player-name">
                {p1?.username || "Unknown"}
              </span>
              <span className="game__player-elo">
                Elo: {p1?.eloRating || "—"}
              </span>
=======
              <span className="game__player-name">{p1?.username || "Unknown"}</span>
              <span className="game__player-elo">Elo: {p1?.eloRating?.[`tc${match.category?.timeControl || 10}`] || "—"}</span>
>>>>>>> master
            </div>
            <span className="game__vs">vs</span>
            <div className="game__player">
              <Avatar imageUrl={p2?.profileImageUrl} size={56} />
<<<<<<< HEAD
              <span className="game__player-name">
                {p2?.username || "Waiting..."}
              </span>
              <span className="game__player-elo">
                {p2 ? `Elo: ${p2.eloRating}` : ""}
              </span>
=======
              <span className="game__player-name">{p2?.username || "Waiting..."}</span>
              <span className="game__player-elo">{p2 ? `Elo: ${p2.eloRating?.[`tc${match.category?.timeControl || 10}`] || "—"}` : ""}</span>
>>>>>>> master
            </div>
          </div>
          <div
            className="game__dice-area"
            style={{ backgroundColor: appearance.boardColor }}
          >
            <GameBoard
              matchId={id}
              userId={user?._id}
              onGameStarted={refetchMatch}
            />
          </div>
        </div>

        <aside className="game__sidebar">
          <h2 className="game__sidebar-title">Comments</h2>
          <div className="game__comments">
            {comments.length === 0 && (
              <p className="game__no-comments">No comments yet.</p>
            )}
            {comments.map((c) => (
              <div key={c._id} className="game__comment">
                <span className="game__comment-author">
                  {c.authorId?.username || "Unknown"}
                </span>
                <span className="game__comment-date">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
                <p className="game__comment-text">{c.text}</p>
              </div>
            ))}
          </div>
          {user ? (
            <form className="game__comment-form" onSubmit={handleCommentSubmit}>
              <textarea
                className="game__comment-input"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Leave a comment..."
                rows={3}
              />
              {commentError && <p className="game__error">{commentError}</p>}
              <button type="submit" className="game__comment-submit">
                Post Comment
              </button>
            </form>
          ) : (
            <p className="game__no-comments">Log in to leave a comment.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
