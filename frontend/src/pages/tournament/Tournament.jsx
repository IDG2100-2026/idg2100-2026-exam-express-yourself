import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getTournament, joinTournament } from "../../services/tournaments-service.js";
import { useComments } from "../../hooks/useComments.js";
import { useAuth } from "../../hooks/useAuth.js";
import { createComment } from "../../services/comments-service.js";

export default function Tournament() {
  const { id } = useParams();
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joinMessage, setJoinMessage] = useState("");
  const { comments, refetch } = useComments("Tournament", id);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState(null);

  useEffect(() => {
    let stale = false;
    async function fetchTournament() {
      try {
        const data = await getTournament(id);
        if (!stale) setTournament(data);
      } catch (err) {
        if (!stale) setError(err.message);
      } finally {
        if (!stale) setIsLoading(false);
      }
    }
    fetchTournament();
    return () => { stale = true; };
  }, [id]);

  async function handleJoin() {
    try {
      await joinTournament(id);
      setJoinMessage("You have joined the tournament!");
      const data = await getTournament(id);
      setTournament(data);
    } catch (err) {
      setJoinMessage(err.message);
    }
  }

  async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentError(null);
    try {
      await createComment(commentText, "Tournament", id);
      setCommentText("");
      refetch();
    } catch (err) {
      setCommentError(err.message);
    }
  }

  if (isLoading) return <p className="tournament__status">Loading tournament...</p>;
  if (error) return <p className="tournament__error">{error}</p>;
  if (!tournament) return null;

  const userId = user?._id || user?.userId;
  const alreadyJoined = tournament.participants?.some((p) => p._id === userId);

  return (
    <div className="tournament">
      <div className="tournament__header">
        <h1 className="tournament__title">{tournament.title}</h1>
        <span className="tournament__status-badge">{tournament.status}</span>
      </div>
      <div className="tournament__info">
        <div className="tournament__info-item"><span className="tournament__info-label">Date</span><span>{new Date(tournament.startDate).toLocaleDateString()}</span></div>
        <div className="tournament__info-item"><span className="tournament__info-label">Format</span><span>Best of {tournament.category?.rounds} — {tournament.category?.straightsAllowed ? "Straights" : "No straights"} — {tournament.category?.timeControl}s</span></div>
        <div className="tournament__info-item"><span className="tournament__info-label">Players</span><span>{tournament.participants?.length || 0} signed up</span></div>
        {tournament.buyIn > 0 && <div className="tournament__info-item"><span className="tournament__info-label">Buy-in</span><span>{tournament.buyIn} points</span></div>}
      </div>
      {tournament.description && <p className="tournament__description">{tournament.description}</p>}
      {user && tournament.status === "upcoming" && !alreadyJoined && <button className="tournament__join" onClick={handleJoin}>Join Tournament</button>}
      {alreadyJoined && <p className="tournament__joined">You are registered for this tournament</p>}
      {joinMessage && <p className="tournament__join-message">{joinMessage}</p>}

      {tournament.trophy && (
        <div className="tournament__trophy">
          <h2 className="tournament__section-title">Trophy</h2>
          <div className="tournament__trophy-item">
            {tournament.trophy.imageUrl && <img src={tournament.trophy.imageUrl} alt={tournament.trophy.title} className="tournament__trophy-img" />}
            <span className="tournament__trophy-title">{tournament.trophy.title}</span>
          </div>
        </div>
      )}

      <div className="tournament__participants">
        <h2 className="tournament__section-title">Participants</h2>
        {tournament.participants?.length === 0 ? <p className="tournament__status">No participants yet.</p> : (
          <ul className="tournament__participant-list">
            {tournament.participants?.map((p) => <li key={p._id} className="tournament__participant">{p.username}</li>)}
          </ul>
        )}
      </div>

      <div className="tournament__comments-section">
        <h2 className="tournament__section-title">Comments</h2>
        <div className="tournament__comments">
          {comments.length === 0 && <p className="tournament__status">No comments yet.</p>}
          {comments.map((c) => (
            <div key={c._id} className="tournament__comment">
              <span className="tournament__comment-author">{c.authorId?.username || "Unknown"}</span>
              <span className="tournament__comment-date">{new Date(c.createdAt).toLocaleDateString()}</span>
              <p className="tournament__comment-text">{c.text}</p>
            </div>
          ))}
        </div>
        {user ? (
          <form className="tournament__comment-form" onSubmit={handleCommentSubmit}>
            <textarea className="tournament__comment-input" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Leave a comment..." rows={3} />
            {commentError && <p className="tournament__error">{commentError}</p>}
            <button type="submit" className="tournament__comment-submit">Post Comment</button>
          </form>
        ) : <p className="tournament__status">Log in to leave a comment.</p>}
      </div>
    </div>
  );
}
