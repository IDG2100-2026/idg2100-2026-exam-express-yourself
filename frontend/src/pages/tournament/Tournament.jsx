import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getTournament,
  joinTournament,
  leaveTournament,
  getStandings,
  startTournament,
  cancelTournament,
  deleteTournament,
} from "../../services/tournaments-service.js";
import { useComments } from "../../hooks/useComments.js";
import { useAuth } from "../../hooks/useAuth.js";
import { createComment } from "../../services/comments-service.js";
import "./tournament.scss";

function getTimeLeft(targetDate) {
  const diff = new Date(targetDate) - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate));
  useEffect(() => {
    if (!targetDate) return;
    setTimeLeft(getTimeLeft(targetDate));
    const timer = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  return timeLeft;
}

export default function Tournament() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [standings, setStandings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMsg, setActionMsg] = useState("");
  const [actionError, setActionError] = useState("");

  const { comments, refetch: refetchComments } = useComments("Tournament", id);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState(null);

  const countdown = useCountdown(tournament?.startDate);

  useEffect(() => {
    let stale = false;
    setIsLoading(true);
    getTournament(id)
      .then((data) => { if (!stale) setTournament(data); })
      .catch((err) => { if (!stale) setError(err.message); })
      .finally(() => { if (!stale) setIsLoading(false); });
    return () => { stale = true; };
  }, [id]);

  useEffect(() => {
    if (!tournament) return;
    if (tournament.status === "in-progress" || tournament.status === "completed") {
      getStandings(id).then(setStandings).catch(() => {});
    }
  }, [tournament, id]);

  async function handleJoin() {
    setActionMsg(""); setActionError("");
    try {
      await joinTournament(id);
      setActionMsg("You have joined the tournament!");
      setTournament(await getTournament(id));
    } catch (err) { setActionError(err.message); }
  }

  async function handleLeave() {
    setActionMsg(""); setActionError("");
    try {
      await leaveTournament(id);
      setActionMsg("You have left the tournament.");
      setTournament(await getTournament(id));
    } catch (err) { setActionError(err.message); }
  }

  async function handleStart() {
    setActionMsg(""); setActionError("");
    try {
      await startTournament(id);
      setActionMsg("Tournament started!");
      setTournament(await getTournament(id));
    } catch (err) { setActionError(err.message); }
  }

  async function handleCancel() {
    if (!confirm("Cancel this tournament?")) return;
    setActionMsg(""); setActionError("");
    try {
      await cancelTournament(id);
      setActionMsg("Tournament cancelled.");
      setTournament(await getTournament(id));
    } catch (err) { setActionError(err.message); }
  }

  async function handleDelete() {
    if (!confirm("Permanently delete this tournament? This cannot be undone.")) return;
    try {
      await deleteTournament(id);
      navigate("/tournaments");
    } catch (err) { setActionError(err.message); }
  }

  async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentError(null);
    try {
      await createComment(commentText, "Tournament", id);
      setCommentText("");
      refetchComments();
    } catch (err) { setCommentError(err.message); }
  }

  if (isLoading) return <p className="tournament__status">Loading tournament...</p>;
  if (error) return <p className="tournament__error">{error}</p>;
  if (!tournament) return null;

  const userId = user?._id || user?.userId;
  const isAdmin = user?.role === "admin";
  const alreadyJoined = tournament.participants?.some((p) => p._id === userId || p === userId);
  const canJoin = user && tournament.status === "upcoming" && !alreadyJoined;
  const canLeave = user && alreadyJoined;

  return (
    <div className="tournament">
      <div className="tournament__header">
        <h1 className="tournament__title">{tournament.title}</h1>
        <span className={`tournament__status-badge tournament__status-badge--${tournament.status}`}>
          {tournament.status.replace("-", " ")}
        </span>
      </div>

      {/* Countdown, only for upcoming tournaments that haven't started */}
      {tournament.status === "upcoming" && countdown && (
        <div className="tournament__countdown">
          <span className="tournament__countdown-label">Starts in</span>
          <div className="tournament__countdown-units">
            <div className="tournament__countdown-unit">
              <span className="tournament__countdown-value">{countdown.days}</span>
              <span className="tournament__countdown-text">days</span>
            </div>
            <div className="tournament__countdown-unit">
              <span className="tournament__countdown-value">{String(countdown.hours).padStart(2, "0")}</span>
              <span className="tournament__countdown-text">hrs</span>
            </div>
            <div className="tournament__countdown-unit">
              <span className="tournament__countdown-value">{String(countdown.minutes).padStart(2, "0")}</span>
              <span className="tournament__countdown-text">min</span>
            </div>
            <div className="tournament__countdown-unit">
              <span className="tournament__countdown-value">{String(countdown.seconds).padStart(2, "0")}</span>
              <span className="tournament__countdown-text">sec</span>
            </div>
          </div>
        </div>
      )}

      <div className="tournament__info">
        <div className="tournament__info-item">
          <span className="tournament__info-label">Date</span>
          <span>{new Date(tournament.startDate).toLocaleString()}</span>
        </div>
        <div className="tournament__info-item">
          <span className="tournament__info-label">Format</span>
          <span>
            Best of {tournament.category?.rounds},{" "}
            {tournament.category?.straightsAllowed ? "Straights" : "No straights"},{" "}
            {tournament.category?.timeControl}s
          </span>
        </div>
        <div className="tournament__info-item">
          <span className="tournament__info-label">Players</span>
          <span>{tournament.participants?.length || 0} signed up</span>
        </div>
        {tournament.buyIn > 0 && (
          <div className="tournament__info-item">
            <span className="tournament__info-label">Buy-in</span>
            <span>{tournament.buyIn} points</span>
          </div>
        )}
        {tournament.eloRange && (tournament.eloRange.min > 0 || tournament.eloRange.max < 9999) && (
          <div className="tournament__info-item">
            <span className="tournament__info-label">Elo range</span>
            <span>{tournament.eloRange.min} – {tournament.eloRange.max}</span>
          </div>
        )}
        {tournament.createdBy && (
          <div className="tournament__info-item">
            <span className="tournament__info-label">Organiser</span>
            <span>{tournament.createdBy.username}</span>
          </div>
        )}
      </div>

      {tournament.description && (
        <p className="tournament__description">{tournament.description}</p>
      )}

      {tournament.rules && (
        <div className="tournament__rules">
          <h2 className="tournament__section-title">Rules</h2>
          <p className="tournament__rules-text">{tournament.rules}</p>
        </div>
      )}

      {/* Join / Leave */}
      <div className="tournament__actions">
        {canJoin && (
          <button className="tournament__btn tournament__btn--primary" onClick={handleJoin}>
            Join Tournament
          </button>
        )}
        {canLeave && (
          <button className="tournament__btn tournament__btn--danger" onClick={handleLeave}>
            Leave Tournament
          </button>
        )}
        {alreadyJoined && tournament.status !== "upcoming" && (
          <p className="tournament__joined">You are registered for this tournament</p>
        )}

        {/* Admin controls */}
        {isAdmin && (
          <div className="tournament__admin-controls">
            <Link
              to={`/admin/tournament/${id}/edit`}
              className="tournament__btn tournament__btn--secondary"
            >
              Edit
            </Link>
            {tournament.status === "upcoming" && (
              <button className="tournament__btn tournament__btn--primary" onClick={handleStart}>
                Start Tournament
              </button>
            )}
            {(tournament.status === "upcoming" || tournament.status === "in-progress") && (
              <button className="tournament__btn tournament__btn--warning" onClick={handleCancel}>
                Cancel
              </button>
            )}
            <button className="tournament__btn tournament__btn--danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        )}
      </div>

      {actionMsg && <p className="tournament__action-msg">{actionMsg}</p>}
      {actionError && <p className="tournament__error">{actionError}</p>}

      {/* Trophy */}
      {tournament.trophy && (
        <div className="tournament__trophy">
          <h2 className="tournament__section-title">Trophy</h2>
          <div className="tournament__trophy-item">
            {tournament.trophy.imageUrl && (
              <img
                src={tournament.trophy.imageUrl}
                alt={tournament.trophy.title}
                className="tournament__trophy-img"
              />
            )}
            <span className="tournament__trophy-title">{tournament.trophy.title}</span>
          </div>
          {tournament.winnerId && (
            <p className="tournament__winner">
              Winner: <strong>{tournament.winnerId.username}</strong>
            </p>
          )}
        </div>
      )}

      {/* Standings, shown when in-progress or completed */}
      {standings && standings.standings?.length > 0 && (
        <div className="tournament__standings">
          <h2 className="tournament__section-title">Standings</h2>
          {standings.standings.map((round) => (
            <div key={round.round} className="tournament__round">
              <h3 className="tournament__round-title">Round {round.round}</h3>
              <div className="tournament__round-matches">
                {round.matches.map((m, i) => (
                  <div key={i} className="tournament__match">
                    <span className={m.winner === m.player1 ? "tournament__match-player--winner" : ""}>
                      {m.player1 || "TBD"}
                    </span>
                    <span className="tournament__match-vs">vs</span>
                    <span className={m.winner === m.player2 ? "tournament__match-player--winner" : ""}>
                      {m.player2 || "TBD"}
                    </span>
                    {m.winner && (
                      <span className="tournament__match-result">→ {m.winner}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Participants */}
      <div className="tournament__participants">
        <h2 className="tournament__section-title">
          Participants ({tournament.participants?.length || 0})
        </h2>
        {!tournament.participants?.length ? (
          <p className="tournament__status">No participants yet.</p>
        ) : (
          <ul className="tournament__participant-list">
            {tournament.participants.map((p) => (
              <li key={p._id} className="tournament__participant">
                <Link to={`/profile/${p._id}`} className="tournament__participant-link">
                  {p.username}
                </Link>
                {p.eloRating && (
                  <span className="tournament__participant-elo">
                    {p.eloRating[`tc${tournament.category?.timeControl || 10}`] ?? p.eloRating.tc10 ?? "?"} Elo
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Comments */}
      <div className="tournament__comments-section">
        <h2 className="tournament__section-title">Comments</h2>
        <div className="tournament__comments">
          {comments.length === 0 && (
            <p className="tournament__status">No comments yet.</p>
          )}
          {comments.map((c) => (
            <div key={c._id} className="tournament__comment">
              <span className="tournament__comment-author">
                {c.authorId?.username || "Unknown"}
              </span>
              <span className="tournament__comment-date">
                {new Date(c.createdAt).toLocaleDateString()}
              </span>
              <p className="tournament__comment-text">{c.text}</p>
            </div>
          ))}
        </div>
        {user ? (
          <form className="tournament__comment-form" onSubmit={handleCommentSubmit}>
            <textarea
              className="tournament__comment-input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Leave a comment..."
              rows={3}
            />
            {commentError && <p className="tournament__error">{commentError}</p>}
            <button type="submit" className="tournament__comment-submit">
              Post Comment
            </button>
          </form>
        ) : (
          <p className="tournament__status">Log in to leave a comment.</p>
        )}
      </div>
    </div>
  );
}
