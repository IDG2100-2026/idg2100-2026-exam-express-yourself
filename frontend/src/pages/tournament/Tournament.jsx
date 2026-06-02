import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  getTournament,
  joinTournament,
  leaveTournament,
  getStandings,
  startTournament,
  cancelTournament,
  deleteTournament,
} from "../../services/tournaments-service.js";
import { useAuth } from "../../hooks/useAuth.js";
import Avatar from "../../components/avatar/Avatar.jsx";
import ConfirmModal from "../../components/confirm-modal/ConfirmModal.jsx";


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
    const timer = setInterval(() => { setTimeLeft(getTimeLeft(targetDate)); }, 1000);
    return () => { clearInterval(timer); };
  }, [targetDate]);
  return timeLeft;
}


export default function Tournament() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?._id || user?.userId;

  const [tournament, setTournament] = useState(null);
  const [standings, setStandings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMsg, setActionMsg] = useState("");
  const [actionError, setActionError] = useState("");
  const [confirmModal, setConfirmModal] = useState(null);
  const targetType = "Tournament";
  const targetId = id;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);

  const countdown = useCountdown(tournament?.startDate);

  useEffect(() => {
    let stale = false;
    setIsLoading(true);
    getTournament(id)
      .then((data) => {
        if (!stale) setTournament(data);
      })
      .catch((err) => {
        if (!stale) setError(err.message);
      })
      .finally(() => {
        if (!stale) setIsLoading(false);
      });
    return () => {
      stale = true;
    };
  }, [id]);

  useEffect(() => {
    if (!tournament) return;
    if (
      tournament.status === "in-progress" ||
      tournament.status === "completed"
    ) {
      getStandings(id)
        .then(setStandings)
        .catch(() => {});
    }
  }, [tournament, id]);

  // Auto-redirect participant to their active match when the tournament is in-progress
  useEffect(() => {
    if (!tournament || tournament.status !== "in-progress" || !userId) return;
    const isParticipant = tournament.participants?.some(
      (participant) => participant._id === userId || participant._id?.toString() === userId
    );
    if (!isParticipant) return;
    const currentRoundData = tournament.bracket?.find(
      (round) => round.round === tournament.currentRound
    );
    if (!currentRoundData) return;
    const myMatch = currentRoundData.matches.find((match) => {
      if (match.winner) return false;
      return match.players.some(
        (player) => (player._id?.toString() || player.toString()) === userId
      );
    });
    if (myMatch?.gameId) {
      navigate(`/game/${myMatch.gameId}`);
    }
  }, [tournament, userId, navigate]);

  async function handleJoin() {
    setActionMsg("");
    setActionError("");
    try {
      await joinTournament(id);
      setActionMsg("You have joined the tournament!");
      setTournament(await getTournament(id));
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleLeave() {
    setActionMsg("");
    setActionError("");
    try {
      await leaveTournament(id);
      setActionMsg("You have left the tournament.");
      setTournament(await getTournament(id));
    } catch (err) {
      setActionError(err.message);
    }
  }

  function handleStart() {
    setConfirmModal({
      message: "Start this tournament?",
      onConfirm: async () => {
        setConfirmModal(null);
        setActionMsg("");
        setActionError("");
        try {
          await startTournament(id);
          setActionMsg("Tournament started!");
          setTournament(await getTournament(id));
        } catch (err) {
          setActionError(err.message);
        }
      },
    });
  }

  function handleCancel() {
    setConfirmModal({
      message: "Cancel this tournament?",
      onConfirm: async () => {
        setConfirmModal(null);
        setActionMsg("");
        setActionError("");
        try {
          await cancelTournament(id);
          setActionMsg("Tournament cancelled.");
          setTournament(await getTournament(id));
        } catch (err) {
          setActionError(err.message);
        }
      },
    });
  }

  function handleDelete() {
    setConfirmModal({
      message: "Delete this tournament?",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await deleteTournament(id);
          navigate("/tournaments");
        } catch (err) {
          setActionError(err.message);
        }
      },
    });
  }

  useEffect(() => {
    const newSocket = new WebSocket(
      `${import.meta.env.VITE_WS_URL}?targetType=${targetType}&targetId=${targetId}`,
    );
    socketRef.current = newSocket;

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "history") {
        setMessages(data.messages);
      } else if (data.type === "new_message") {
        setMessages((prevMsg) => { return [...prevMsg, data.message]; });
      } else if (data.type === "error") {
        console.error("Server error:", data.message);
      }
    };

    newSocket.onopen = () => {
      console.log("Websocket connected");
    };
    newSocket.onclose = () => {
      console.log("Websocket disconnected");
    };

    return () => { newSocket.close(); };
  }, [targetId, targetType]);

  const sendMessage = () => {
    if (input.trim() && socketRef.current?.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({
        authorId: user?._id,
        text: input,
      });
      socketRef.current.send(payload);
      setInput("");
    }
  };

  if (isLoading)
    return <p className="tournament__status">Loading tournament...</p>;
  if (error) return <p className="tournament__error">{error}</p>;
  if (!tournament) return null;

  const isAdmin = user?.role === "admin";
  const alreadyJoined = tournament.participants?.some(
    (participant) => participant._id === userId || participant === userId,
  );
  const canJoin = user && tournament.status === "upcoming" && !alreadyJoined;
  const canLeave = user && alreadyJoined && (tournament.status === "upcoming" || tournament.status === "in-progress");
  const hasActions = canJoin || canLeave || (alreadyJoined && tournament.status === "in-progress") || isAdmin;

  return (
    <div className="tournament stack-l">
      <div className="tournament__header">
        <h1>{tournament.title}</h1>
        <span
          className={`tournament__status-badge tournament__status-badge--${tournament.status}`}
        >
          {tournament.status.replace("-", " ")}
        </span>
      </div>

      {tournament.winnerId && (
        <div className="tournament__winner">
          <span className="tournament__countdown-label">Winner</span>
          <div className="tournament__winner-profile">
            <Avatar imageUrl={tournament.winnerId.profileImageUrl} username={tournament.winnerId.username} size={48} />
            <Link to={`/profile/${tournament.winnerId._id}`}><span>{tournament.winnerId.username}</span></Link>
          </div>
        </div>
      )}

      {/* Countdown, only for upcoming tournaments that haven't started */}
      {tournament.status === "upcoming" && countdown && (
        <div className="tournament__countdown">
          <span className="tournament__countdown-label">Starts in</span>
          <div className="tournament__countdown-units">
            <div className="tournament__countdown-unit">
              <span className="tournament__countdown-value">
                {countdown.days}
              </span>
              <span className="tournament__countdown-text">days</span>
            </div>
            <div className="tournament__countdown-unit">
              <span className="tournament__countdown-value">
                {String(countdown.hours).padStart(2, "0")}
              </span>
              <span className="tournament__countdown-text">hrs</span>
            </div>
            <div className="tournament__countdown-unit">
              <span className="tournament__countdown-value">
                {String(countdown.minutes).padStart(2, "0")}
              </span>
              <span className="tournament__countdown-text">min</span>
            </div>
            <div className="tournament__countdown-unit">
              <span className="tournament__countdown-value">
                {String(countdown.seconds).padStart(2, "0")}
              </span>
              <span className="tournament__countdown-text">sec</span>
            </div>
          </div>
        </div>
      )}

      <div className="tournament__info">
        <span className="tournament__countdown-label">Tournament details</span>
        {tournament.createdBy && (
          <div className="tournament__info-item">
            <span className="tournament__info-label">Organiser</span>
            <span>{tournament.createdBy.username}</span>
          </div>
        )}
        <div className="tournament__info-item">
          <span className="tournament__info-label">Date</span>
          <span>
            {new Date(tournament.startDate).toLocaleString("en-GB", {
              year: "numeric", month: "2-digit", day: "2-digit",
              hour: "2-digit", minute: "2-digit",
            })}
          </span>
        </div>
        <div className="tournament__info-item">
          <span className="tournament__info-label">Format</span>
          <span>
            Best of {tournament.category?.rounds},{" "}
            {tournament.category?.timeControl}s{tournament.category?.straightsAllowed ? ", Straights" : ", No straights"}
          </span>
        </div>
        <div className="tournament__info-item">
          <span className="tournament__info-label">Rounds</span>
          <span>{tournament.numberOfRounds} tournament rounds</span>
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
            <span>{tournament.eloRange.min} - {tournament.eloRange.max}</span>
          </div>
        )}
        {tournament.description && (
          <div className="tournament__info-item">
            <span className="tournament__info-label">Description</span>
            <span>{tournament.description}</span>
          </div>
        )}
      </div>

      {tournament.trophy && (
        <div className="tournament__trophy stack-m">
          <h2>Trophy</h2>
          <div className="tournament__trophy-item">
            {tournament.trophy.imageUrl && (
              <img src={tournament.trophy.imageUrl} alt={tournament.trophy.title} className="tournament__trophy-img" />
            )}
            <span>{tournament.trophy.title}</span>
          </div>
        </div>
      )}

      {/* Join / Leave */}
      {hasActions && <div className="tournament__actions">
        {canJoin && (
          <button
            className="btn btn--primary"
            onClick={handleJoin}
          >
            Join tournament
          </button>
        )}
        {canLeave && (
          <button
            className="btn btn--red"
            onClick={handleLeave}
          >
            Leave tournament
          </button>
        )}
        {alreadyJoined && tournament.status === "in-progress" && (
          <p className="tournament__joined">
            You are registered for this tournament
          </p>
        )}

        {/* Admin controls */}
        {isAdmin && (
          <div className="tournament__admin-controls">
            <Link
              to={`/admin/tournament/${id}/edit`}
              className="btn btn--secondary"
            >
              Edit
            </Link>
            {tournament.status === "upcoming" && (
              <button
                className="btn btn--primary"
                onClick={handleStart}
              >
                Start tournament
              </button>
            )}
            {(tournament.status === "upcoming" ||
              tournament.status === "in-progress") && (
              <button
                className="btn btn--red"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
            <button
              className="btn btn--red"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        )}
      </div>}

      {actionMsg && <p className="tournament__action-msg">{actionMsg}</p>}
      {actionError && <p className="tournament__error">{actionError}</p>}

      {/* Live matches, spectators click in, participants are auto-redirected */}
      {tournament.status === "in-progress" && tournament.bracket?.length > 0 && (
        <div className="tournament__live-matches stack-m">
          <h2>
            Round {tournament.currentRound}: Live matches
          </h2>
          <div className="tournament__live-match-list">
            {tournament.bracket
              .find((round) => round.round === tournament.currentRound)
              ?.matches.map((match, matchIndex) => (
                <Link key={matchIndex} to={`/game/${match.gameId}`} className="tournament__live-match">
                  <span>{match.players[0]?.username || "TBD"}</span>
                  <span className="tournament__match-vs">vs</span>
                  <span>{match.players[1]?.username || "TBD"}</span>
                  {match.winner && (
                    <span className="tournament__match-result">{match.winner.username} won</span>
                  )}
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Standings, shown when in-progress or completed */}
      {standings && standings.standings?.length > 0 && (
        <div className="tournament__standings stack-m">
          <h2>Standings</h2>
          {standings.standings.map((round) => (
            <div key={round.round} className="tournament__round stack-s">
              <h3>Round {round.round}</h3>
              <div className="tournament__round-matches">
                {round.matches.map((match, matchIndex) => (
                  <div key={matchIndex} className="tournament__match">
                    <span
                      className={
                        match.winner === match.player1
                          ? "tournament__match-player--winner"
                          : ""
                      }
                    >
                      {match.player1 || "TBD"}
                    </span>
                    <span className="tournament__match-vs">vs</span>
                    <span
                      className={
                        match.winner === match.player2
                          ? "tournament__match-player--winner"
                          : ""
                      }
                    >
                      {match.player2 || "TBD"}
                    </span>
                    {match.winner && (
                      <span className="tournament__match-result">{match.winner} won</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Participants */}
      <div className="tournament__participants stack-m">
        <h2>
          Participants ({tournament.participants?.length || 0})
        </h2>
        {!tournament.participants?.length ? (
          <p className="tournament__status">No participants yet.</p>
        ) : (
          <ul className="tournament__participant-list">
            {tournament.participants.map((participant) => (
              <li key={participant._id} className="tournament__participant">
                <Link
                  to={`/profile/${participant._id}`}
                  className="tournament__participant-link"
                >
                  {participant.username}
                </Link>
                {participant.eloRating && (
                  <span className="tournament__participant-elo">
                    {participant.eloRating[
                      `tc${tournament.category?.timeControl || 10}`
                    ] ??
                      participant.eloRating.tc10 ??
                      "?"}{" "}
                    Elo
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Comments */}
      <div className="tournament__comments-section stack-m">
        <h2>Comments</h2>
        <div className="tournament__comments">
          {messages.length === 0 && (
            <p className="tournament__status">No comments yet.</p>
          )}
          {messages.map((message) => (
            <div key={message._id} className="tournament__comment">
              <div className="tournament__comment-header">
                <Avatar imageUrl={message.authorId?.profileImageUrl} username={message.authorId?.username} size={32} />
                <span className="tournament__comment-author">
                  {message.authorId?.username}
                </span>
              </div>
              <span className="tournament__comment-date">
                {new Date(message.createdAt).toLocaleDateString("en-GB")}
              </span>
              <p className="tournament__comment-text">{message.text}</p>
            </div>
          ))}
        </div>
        {user ? (
          <form className="tournament__comment-form">
            <textarea
              className="tournament__comment-input"
              value={input}
              onChange={(e) => { setInput(e.target.value); }}
              placeholder="Leave a comment..."
              rows={3}
            />
            <button
              onClick={sendMessage}
              type="button"
              className="btn btn--primary"
            >
              Post comment
            </button>
          </form>
        ) : (
          <p className="tournament__status">Log in to leave a comment.</p>
        )}
      </div>

      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => { setConfirmModal(null); }}
        />
      )}
    </div>
  );
}
