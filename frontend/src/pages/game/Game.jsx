import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMatch } from "../../hooks/useMatch.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useAppearance } from "../../hooks/useAppearance.js";
import { leaveMatch } from "../../services/matches-service.js";
import Avatar from "../../components/avatar/Avatar.jsx";

export default function Game() {
  const { id } = useParams();
  const { user } = useAuth();
  const { appearance } = useAppearance();
  const { match, isLoading, error } = useMatch(id);
  const navigate = useNavigate();

  const targetType = "Match"; // hardcoded since this is the match page
  const targetId = id; // the specific game's MongoDB _id
  const [messages, setMessages] = useState([]); // array to store messages
  const [input, setInput] = useState("");
  const socketRef = useRef(null); // websocket connection! useRef to not trigger re-render when entering the match
  const [isConnected, setIsConnected] = useState(false);

  async function handleLeave() {
    try {
      await leaveMatch(id);
    } catch {
      /* ignore, navigate anyway */
    }
    navigate("/lobby");
  }

  useEffect(() => {
    // Connect with targetType and targetId from your route params
    const newSocket = new WebSocket(
      `${import.meta.env.VITE_WS_URL}?targetType=${targetType}&targetId=${targetId}`,
    );
    socketRef.current = newSocket;

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data); // parses raw string into json object

      if (data.type === "history") {
        setMessages(data.messages); // load previous comments from DB
      } else if (data.type === "new_message") {
        setMessages((prev) => [...prev, data.message]); // append new comments into the message array
      } else if (data.type === "error") {
        console.error("Server error:", data.message); // handle errors
      }
    };

    newSocket.onopen = () => {
      console.log("Websocket connected"); // gives a msg to the clients browser that they are connected
    };
    newSocket.onclose = () => {
      console.log("Websocket disconnected"); // gives a msg to the clients browser that they are disconnected
    };

    return () => newSocket.close(); // clean up on unmount. if not done, the connection would still be live after moving away from the page
  }, [targetType, targetId]); // re-render if any of these change!

  const sendMessage = () => {
    if (input.trim() && socketRef.current?.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({
        authorId: user?._id, // send the user's ObjectId
        text: input, // send the comment text
      });
      socketRef.current.send(payload); // send over WebSocket
      setInput(""); // clear the input field
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
                  "-"}
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
                  ? `Elo: ${p2.eloRating?.[`tc${match.category?.timeControl || 10}`] || "-"}`
                  : ""}
              </span>
            </div>
          </div>
          <div
            className="game__dice-area"
            style={{ backgroundColor: appearance.boardColor }}
          >
            <p>Best of {match.category?.rounds}</p>
            <p>
              Straights allowed:{" "}
              {match.category?.straightsAllowed ? "Yes" : "No"}
            </p>
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
                <Avatar
                  imageUrl={message.authorId?.profileImageUrl}
                  size={32}
                />

                <div className="game__comment-body">
                  <span className="game__comment-author">
                    {message.authorId?.username || "Unknown"}
                  </span>
                  <span className="game__comment-date">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="game__comment-text">{message.text}</p>
              </div>
            ))}
          </div>
          {user ? (
            <form className="game__comment-form">
              <textarea
                className="game__comment-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Leave a comment..."
              />
              <button
                onClick={sendMessage}
                type="button"
                className="game__comment-submit"
              >
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
