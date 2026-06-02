import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useMatch } from "../../hooks/useMatch.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useAppearance } from "../../hooks/useAppearance.js";
import { leaveMatch } from "../../services/matches-service.js";
import { sounds } from "../../services/sound-service.js";
import Avatar from "../../components/avatar/Avatar.jsx";

// Register the custom elements as side effects
import "../../components/web-components/dice-poker-die.js";
import "../../components/web-components/dice-poker-board.js";

export default function Game() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appearance } = useAppearance();
  const { match, isLoading, error } = useMatch(id);
  // Game state
  const [phase, setPhase] = useState("rolling");
  const [pot, setPot] = useState(0);
  const [highestBet, setHighestBet] = useState(0);
  const [betAmount, setBetAmount] = useState(10);
  const [gameEnded, setGameEnded] = useState(null);

  const wsRef = useRef(null);
  const boardRef = useRef(null);

  const userId = user?._id || user?.userId;

  const myIndex = match?.players?.findIndex((player) => {
    const playerId = player.userId?._id ? player.userId._id : player.userId;
    return playerId === userId;
  }) ?? -1;
  const isPlayer = myIndex !== -1;
  let myKey = "player2";
  if (myIndex === 0) { myKey = "player1"; }

  // Comment WebSocket state
  const targetType = "Match";
  const targetId = id;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);


  useEffect(() => {
    const handleMatchOver = () => navigate("/lobby");
    window.addEventListener("board:matchOver", handleMatchOver);
    return () => window.removeEventListener("board:matchOver", handleMatchOver);
  }, [navigate]);

  // Sound effects, gated by appearance.sound setting
  useEffect(() => {
    if (!appearance.sound) return;
    const play = (fn) => () => fn();
    const handlers = [
      ["dp:roll-executed",   play(sounds.roll)],
      ["dp:die-held-changed", play(sounds.hold)],
      ["dp:round-start",     play(sounds.roundStart)],
      ["dp:round-decided",   play(sounds.roundEnd)],
      ["dp:match-decided",   play(sounds.gameEnd)],
    ];
    handlers.forEach(([evt, fn]) => window.addEventListener(evt, fn));
    return () => handlers.forEach(([evt, fn]) => window.removeEventListener(evt, fn));
  }, [appearance.sound]);

  async function handleLeave() {
    try { await leaveMatch(id); } catch { /* ignore */ }
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
        setMessages((prev) => { return [...prev, data.message]; }); // append new comments into the message array
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

    return () => { newSocket.close(); }; // clean up on unmount. if not done, the connection would still be live after moving away from the page
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

  const tc = match.category?.timeControl ? match.category.timeControl : 10;
  const maxSlots = match.maxPlayers ? match.maxPlayers : 2;
  const playerSlots = [];
  for (let i = 0; i < maxSlots; i++) {
    const player = match.players?.[i]?.userId;
    if (player) {
      playerSlots.push(player);
    } else {
      playerSlots.push(null);
    }
  }

  return (
    <div className="game">
      <div className="game__layout">
        <div className="game__board">

          {/* Waiting for opponent */}
          {match.status === "waiting" && (
            <div className="game__waiting">
              <p>Waiting for another player to join...</p>
              <small>Refreshes every 15 seconds</small>
              {isPlayer && (
                <button className="btn btn--red" onClick={handleLeave}>
                  Leave game
                </button>
              )}
            </div>
          )}

          {/* Player headers */}
          <div className="game__players">
            {playerSlots.map((player, index) => {
              return (
                <div key={index} className="game__player">
                  <Avatar imageUrl={player?.profileImageUrl} username={player?.username} size={48} />
                  <span className="game__player-name">
                    {player ? <Link to={`/profile/${player._id}`}>{player.username}</Link> : "Waiting..."}
                  </span>
                  {player && (
                    <span className="game__player-elo">
                      Elo: {player.eloRating?.[`tc${tc}`] ? player.eloRating[`tc${tc}`] : "?"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Game details */}
          <ul className="game__meta">
            <li>Best of {match.category?.rounds}</li>
            <li>{match.category?.timeControl}s</li>
            <li>{match.category?.straightsAllowed ? "Straights" : "No straights"}</li>
            <li>{match.buyIn || 1}pt buy-in</li>
            <li>{match.maxPlayers} players</li>
          </ul>

          {/* Active game */}
          {match.status === "in-progress" && (
            <div className="game__active">

              {/* The dice board web component */}
              <dice-poker-board
                ref={boardRef}
                player1={playerSlots[0] ? playerSlots[0].username : "Player 1"}
                player2={playerSlots[1] ? playerSlots[1].username : "Player 2"}
                bestof={String(match.category?.rounds || 3)}
                include-straight={String(match.category?.straightsAllowed ?? true)}
                style={{
                  width: "100%",
                  "--board-bg-color": appearance.boardColor,
                }}
              />

              {/* Game-over overlay */}
              {gameEnded && (
                <div className="game__ended">
                  <h2>Game over</h2>
                  <p>
                    Winner:{" "}
                    {match.players
                      ?.find(
                        (player) => {
                          return String(player.userId?._id || player.userId) ===
                            String(gameEnded.winnerId);
                        }
                      )
                      ?.userId?.username || "Unknown"}
                  </p>
                  <button className="btn btn--primary" onClick={() => { navigate("/"); }}>Back to lobby</button> {/*TODO: Need ficx */}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar: comments */}
        <aside className="game__sidebar">
          <h2>Comments</h2>
          <div className="game__comments">
            {messages.length === 0 && (
              <p className="game__no-comments">No comments yet.</p>
            )}
            {messages.map((message) => {
              return (
                <div key={message._id} className="game__comment">
                  <div className="game__comment-header">
                    <Avatar
                      imageUrl={message.authorId?.profileImageUrl}
                      username={message.authorId?.username}
                      size={32}
                    />
                    <span className="game__comment-author">
                      {message.authorId?.username || "Unknown"}
                    </span>
                  </div>
                  <span className="game__comment-date">
                    {new Date(message.createdAt).toLocaleDateString("en-GB")}
                  </span>
                  <p className="game__comment-text">{message.text}</p>
                </div>
              );
            })}
          </div>
          {user ? (
            <form className="game__comment-form">
              <textarea
                className="game__comment-input"
                value={input}
                onChange={(e) => { setInput(e.target.value); }}
                placeholder="Leave a comment..."
                rows={3}
              />
              <button onClick={sendMessage} type="button" className="btn btn--primary">
                Post comment
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
