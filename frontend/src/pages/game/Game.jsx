import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMatch } from "../../hooks/useMatch.js";
import { useComments } from "../../hooks/useComments.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useAppearance } from "../../hooks/useAppearance.js";
import { createComment } from "../../services/comments-service.js";
import { leaveMatch } from "../../services/matches-service.js";
import Avatar from "../../components/avatar/Avatar.jsx";

export default function Game() {
  const [messages, setMessages] = useState([]); // array to store messages
  const [input, setInput] = useState("");
  const socketRef = useRef(null);

  const { id } = useParams();
  const { user } = useAuth();
  const { appearance } = useAppearance();
  const { match, isLoading, error } = useMatch(id);
  const navigate = useNavigate();

  async function handleLeave() {
    try {
      await leaveMatch(id);
    } catch {
      /* ignore, navigate anyway */
    }
    navigate("/lobby");
  }

  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:3000");
    socketRef.current = newSocket;

    newSocket.onopen = () => {
      console.log("Websocket connection successful");
    };

    newSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, message]);
    };

    newSocket.onclose = () => {
      console.log("Websocket connection closed");
    };

    newSocket.onerror = (error) => {
      console.error("Websocket error", error);
    };

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() && socketRef.current?.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({
        username: user?.username,
        profileImageUrl: user?.profileImageUrl,
        text: input,
      });
      socketRef.current.send(payload);
      setInput("");
    }
  };

  if (isLoading) return <p className="game__status">Loading game...</p>;
  if (error) return <p className="game__error">Error: {error}</p>;
  if (!match) return <p className="game__error">Match not found</p>;

  const p1 = match.players?.[0]?.userId;
  const p2 = match.players?.[1]?.userId;
  const userId = user?._id || user?.userId;
  const isPlayer = match.players?.some(
    (p) => (p.userId?._id || p.userId) === userId,
  );

  return (
    <div className="game">
      <div className="game__layout">
        <div className="game__board">
          {match.status === "waiting" && (
            <div className="game__waiting">
              <p>Waiting for another player to join...</p>
              <small>This page refreshes every 15 seconds</small>
              {isPlayer && (
                <button className="game__leave-btn" onClick={handleLeave}>
                  Leave Game
                </button>
              )}
            </div>
          )}
          <div className="game__players">
            <div className="game__player">
              <Avatar imageUrl={p1?.profileImageUrl} size={56} />
              <span className="game__player-name">
                {p1?.username || "Unknown"}
              </span>
              <span className="game__player-elo">
                Elo:{" "}
                {p1?.eloRating?.[`tc${match.category?.timeControl || 10}`] ||
                  "—"}
              </span>
            </div>
            <span className="game__vs">vs</span>
            <div className="game__player">
              <Avatar imageUrl={p2?.profileImageUrl} size={56} />
              <span className="game__player-name">
                {p2?.username || "Waiting..."}
              </span>
              <span className="game__player-elo">
                {p2
                  ? `Elo: ${p2.eloRating?.[`tc${match.category?.timeControl || 10}`] || "—"}`
                  : ""}
              </span>
            </div>
          </div>
          <div
            className="game__dice-area"
            style={{ backgroundColor: appearance.boardColor }}
          >
            {/* <p>
              Board — Best of {match.category?.rounds} —{" "}
              {match.category?.straightsAllowed ? "Straights" : "No straights"}{" "}
              — {match.category?.timeControl}s
            </p> */}
            <p>Best of {match.category?.rounds}</p>
            <p>Straights allowed: {match.category?.straightsAllowed ? "Yes" : "No"}</p>
            <p>Time Control: {match.category?.timeControl}s</p>
          </div>
        </div>

        <aside className="game__sidebar">
          <h2 className="game__sidebar-title">Comments</h2>
          <div className="game__comments">
            {messages.length === 0 && (
              <p className="game__no-comments">No comments yet.</p>
            )}
            {messages.map((message, index) => (
              <div key={index} className="game__comment">
                <Avatar imageUrl={message.profileImageUrl} size={32} />
                <div className="game__comment-body">
                  <span className="game__comment-author">{message.username || "Unknown"}</span>
                  <p className="game__comment-text">{message.text}</p>
                </div>
              </div>
            ))}
          </div>
          {user ? (
              <form
                className="game__comment-form"
              >
                <textarea
                  className="game__comment-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Leave a comment..."
                />
                <button onClick={sendMessage} type="button" className="game__comment-submit">
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
