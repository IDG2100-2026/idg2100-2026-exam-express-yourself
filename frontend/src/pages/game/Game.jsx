import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useMatch } from "../../hooks/useMatch.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useAppearance } from "../../hooks/useAppearance.js";
import { leaveMatch } from "../../services/matches-service.js";
import Avatar from "../../components/avatar/Avatar.jsx";

// Register the custom elements as side effects
import "../../components/web-components/dice-poker-die.js";
import "../../components/web-components/dice-poker-board.js";
import "../../components/web-components/dice-poker-monitor.js";

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

  const myIndex = match?.players?.findIndex(
    (p) => (p.userId?._id || p.userId) === userId
  ) ?? -1;
  const isPlayer = myIndex !== -1;
  const myKey = myIndex === 0 ? "player1" : "player2";

  // Comment WebSocket state
  const targetType = "Match";
  const targetId = id;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);

  // function send(msg) {
  //   if (wsRef.current?.readyState === WebSocket.OPEN) {
  //     wsRef.current.send(JSON.stringify(msg));
  //   }
  // }

  // useEffect(() => {
  //   if (!match || match.status !== "in-progress" || !userId) return;

  //   const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  //   const ws = new WebSocket(`${proto}//${window.location.hostname}:3000`);
  //   wsRef.current = ws;

  //   ws.onopen = () => {
  //     console.log("[WS] connected, userId:", userId, "myKey:", myKey);
  //     ws.send(JSON.stringify({ type: "join", matchId: id, userId }));
  //   };

  //   ws.onmessage = (e) => {
  //     try {
  //       const msg = JSON.parse(e.data);
  //       console.log("[WS] received:", msg);
  //       handleMsg(msg);
  //     } catch { /* ignore malformed messages */ }
  //   };

  //   ws.onerror = (e) => console.error("[WS] error", e);

  //   return () => {
  //     ws.close();
  //     wsRef.current = null;
  //   };
  // }, [match?.status, id, userId]);

  // function handleMsg(msg) {
  //   const board = boardRef.current;

  //   switch (msg.type) {
  //     case "turn:changed": {
  //       const turnKey = msg.currentPlayerIndex === 0 ? "player1" : "player2";
  //       setPhase(msg.phase || "rolling");
  //       if (board) {
  //         board.setTurn(turnKey, 3);
  //         if (msg.phase === "rolling" && turnKey === myKey) {
  //           board.autoRoll();
  //         }
  //       }
  //       break;
  //     }

  //     case "round:started":
  //       setPhase("rolling");
  //       setPot(0);
  //       setHighestBet(0);
  //       break;

  //     case "bet:placed":
  //       setPot(msg.pot);
  //       setHighestBet(msg.highestBet);
  //       break;

  //     case "bet:matched":
  //       setPot(msg.pot);
  //       break;

  //     case "game:ended":
  //       setGameEnded({ winnerId: msg.winnerId, players: msg.players });
  //       break;

  //     case "error":
  //       console.error("WebSocket error:", msg.message);
  //       break;
  //   }
  // }

  // useEffect(() => {
  //   const board = boardRef.current;
  //   if (!board) return;

  //   const onRoll = (e) => {
  //     if (!isPlayer) return;
  //     if (e.detail?.player !== myKey) return;
  //     send({ type: "roll", matchId: id, userId });
  //   };

  //   const onHeld = () => {
  //     if (!isPlayer) return;
  //     const myDice = myKey === "player1" ? board._diceP1 : board._diceP2;
  //     const held = myDice.map((d) => d.getAttribute("held") === "true");
  //     send({ type: "hold", matchId: id, userId, held });
  //   };

  //   const onEndTurn = () => {
  //     if (!isPlayer) return;
  //     send({ type: "endTurn", matchId: id, userId });
  //   };

  //   const onMatchOver = () => {
  //     navigate("/lobby");
  //   };

  //   board.addEventListener("dp:roll-executed", onRoll);
  //   board.addEventListener("dp:die-held-changed", onHeld);
  //   board.addEventListener("board:endTurn", onEndTurn);
  //   board.addEventListener("board:matchOver", onMatchOver);

  //   return () => {
  //     board.removeEventListener("dp:roll-executed", onRoll);
  //     board.removeEventListener("dp:die-held-changed", onHeld);
  //     board.removeEventListener("board:endTurn", onEndTurn);
  //     board.removeEventListener("board:matchOver", onMatchOver);
  //   };
  // }, [match?.status, isPlayer, myKey, id, userId]);

  //TODO: Noe vits å ha disse 100 linjene med kode når de ikke gjør noe? 
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
  const tc = match.category?.timeControl || 10;

  return (
    <div className="game">
      <div className="game__layout">
        <div className="game__board">

          {/* ── Waiting for opponent ── */}
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

          {/* ── Player headers ── */}
          <div className="game__players">
            <div className="game__player">
              <Avatar imageUrl={p1?.profileImageUrl} username={p1?.username} size={56} />
              <span className="game__player-name">{p1?.username || "Unknown"}</span>
              <span className="game__player-elo">
                Elo: {p1?.eloRating?.[`tc${tc}`] || "?"}
              </span>
            </div>
            <span className="game__vs">vs</span>
            <div className="game__player">
              <Avatar imageUrl={p2?.profileImageUrl} username={p2?.username} size={56} />
              <span className="game__player-name">{p2?.username || "Waiting..."}</span>
              <span className="game__player-elo">
                {p2 ? `Elo: ${p2?.eloRating?.[`tc${tc}`] || "?"}` : ""}
              </span>
            </div>
          </div>

          {/* ── Active game ── */}
          {match.status === "in-progress" && (
            <div className="game__active">

              {/* The dice board web component */}
              <dice-poker-board
                ref={boardRef}
                player1={p1?.username || "Player 1"}
                player2={p2?.username || "Player 2"}
                bestof={String(match.category?.rounds || 3)}
                include-straight={String(match.category?.straightsAllowed ?? true)}
                style={{
                  width: "100%",
                  "--board-bg-color": appearance.boardColor,
                }}
              />

              {/* Betting controls, only shown to players during betting phase */}
              {phase === "betting" && isPlayer && (
                <div className="game__betting">
                  <p className="game__pot">
                    Pot: {pot} pts, Highest bet: {highestBet} pts
                  </p>
                  <div className="game__bet-controls">
                    <input
                      type="number"
                      className="game__bet-input"
                      value={betAmount}
                      min={1}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                    />
                    <button
                      className="btn btn--primary"
                      onClick={() =>
                        send({ type: "bet", matchId: id, userId, amount: betAmount })
                      }
                    >
                      Bet
                    </button>
                    <button
                      className="btn btn--primary"
                      onClick={() =>
                        send({ type: "raise", matchId: id, userId, amount: betAmount })
                      }
                    >
                      Raise
                    </button>
                    <button
                      className="btn btn--primary"
                      onClick={() => send({ type: "match", matchId: id, userId })}
                    >
                      Match
                    </button>
                    <button
                      className="btn btn--red"
                      onClick={() => send({ type: "fold", matchId: id, userId })}
                    >
                      Fold
                    </button>
                  </div>
                </div>
              )}

              {/* Game-over overlay */}
              {gameEnded && (
                <div className="game__ended">
                  <h2>Game Over</h2>
                  <p>
                    Winner:{" "}
                    {match.players
                      ?.find(
                        (p) =>
                          String(p.userId?._id || p.userId) ===
                          String(gameEnded.winnerId)
                      )
                      ?.userId?.username || "Unknown"}
                  </p>
                  <button onClick={() => navigate("/lobby")}>Back to Lobby</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Sidebar: comments ── */}
        <aside className="game__sidebar">
          <h2>Comments</h2>
          <div className="game__comments">
            {messages.length === 0 && (
              <p className="game__no-comments">No comments yet.</p>
            )}
            {messages.map((message, index) => (
              <div key={index} className="game__comment">
                <Avatar
                  imageUrl={message.authorId?.profileImageUrl}
                  username={message.authorId?.username}
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
            <form
              className="game__comment-form"
            >
              <textarea
                className="game__comment-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Leave a comment..."
                rows={3}
              />
              <button onClick={sendMessage} type="button" className="btn btn--primary">
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
