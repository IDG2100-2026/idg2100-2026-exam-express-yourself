import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMatch } from "../../hooks/useMatch.js";
import { useComments } from "../../hooks/useComments.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useAppearance } from "../../hooks/useAppearance.js";
import { createComment } from "../../services/comments-service.js";
import { leaveMatch } from "../../services/matches-service.js";
import { sounds } from "../../services/sound-service.js";
import Avatar from "../../components/avatar/Avatar.jsx";
import "./game.scss";

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
  const { comments, refetch: refetchComments } = useComments("Match", id);

  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState(null);
  const [phase, setPhase] = useState("rolling");
  const [pot, setPot] = useState(0);
  const [highestBet, setHighestBet] = useState(0);
  const [betAmount, setBetAmount] = useState(10);
  const [gameEnded, setGameEnded] = useState(null);

  const wsRef = useRef(null);
  const boardRef = useRef(null);

  const userId = user?._id || user?.userId;

  // Which player slot am I? (0 = player1, 1 = player2)
  const myIndex = match?.players?.findIndex(
    (p) => (p.userId?._id || p.userId) === userId
  ) ?? -1;
  const isPlayer = myIndex !== -1;
  const myKey = myIndex === 0 ? "player1" : "player2";

  // Send a message through the WebSocket
  function send(msg) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }

  // Connect to WebSocket when the game is in-progress
  useEffect(() => {
    if (!match || match.status !== "in-progress" || !userId) return;

    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${proto}//${window.location.hostname}:3000`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] connected, userId:", userId, "myKey:", myKey);
      ws.send(JSON.stringify({ type: "join", matchId: id, userId }));
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        console.log("[WS] received:", msg);
        handleMsg(msg);
      } catch { /* ignore malformed messages */ }
    };

    ws.onerror = (e) => console.error("[WS] error", e);

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [match?.status, id, userId]);

  // Handle incoming WebSocket messages
  function handleMsg(msg) {
    const board = boardRef.current;

    switch (msg.type) {
      case "turn:changed": {
        const turnKey = msg.currentPlayerIndex === 0 ? "player1" : "player2";
        setPhase(msg.phase || "rolling");
        if (board) {
          board.setTurn(turnKey, 3);
          // Auto-roll on my browser when it becomes my turn
          if (msg.phase === "rolling" && turnKey === myKey) {
            board.autoRoll();
          }
        }
        break;
      }

      case "round:started":
        setPhase("rolling");
        setPot(0);
        setHighestBet(0);
        break;

      case "bet:placed":
        setPot(msg.pot);
        setHighestBet(msg.highestBet);
        break;

      case "bet:matched":
        setPot(msg.pot);
        break;

      case "game:ended":
        setGameEnded({ winnerId: msg.winnerId, players: msg.players });
        break;

      case "error":
        console.error("WebSocket error:", msg.message);
        break;
    }
  }

  // Listen to board events and forward them to the server
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    // Player rolled — only forward MY rolls to the server
    // (board also auto-rolls the opponent locally for visual purposes)
    const onRoll = (e) => {
      if (!isPlayer) return;
      if (e.detail?.player !== myKey) return;
      send({ type: "roll", matchId: id, userId });
    };

    // A die was held/unheld — send the full held array to the server
    const onHeld = () => {
      if (!isPlayer) return;
      const myDice = myKey === "player1" ? board._diceP1 : board._diceP2;
      const held = myDice.map((d) => d.getAttribute("held") === "true");
      send({ type: "hold", matchId: id, userId, held });
    };

    // End-turn button clicked — tell the server
    const onEndTurn = () => {
      if (!isPlayer) return;
      send({ type: "endTurn", matchId: id, userId });
    };

    const onMatchOver = () => {
      navigate("/lobby");
    };

    board.addEventListener("dp:roll-executed", onRoll);
    board.addEventListener("dp:die-held-changed", onHeld);
    board.addEventListener("board:endTurn", onEndTurn);
    board.addEventListener("board:matchOver", onMatchOver);

    return () => {
      board.removeEventListener("dp:roll-executed", onRoll);
      board.removeEventListener("dp:die-held-changed", onHeld);
      board.removeEventListener("board:endTurn", onEndTurn);
      board.removeEventListener("board:matchOver", onMatchOver);
    };
  }, [match?.status, isPlayer, myKey, id, userId]);

  // Sound effects — gated by appearance.sound setting
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

  async function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentError(null);
    try {
      await createComment(commentText, "Match", id);
      setCommentText("");
      refetchComments();
    } catch (err) {
      setCommentError(err.message);
    }
  }

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
                <button className="game__leave-btn" onClick={handleLeave}>
                  Leave game
                </button>
              )}
            </div>
          )}

          {/* ── Player headers ── */}
          <div className="game__players">
            <div className="game__player">
              <Avatar imageUrl={p1?.profileImageUrl} size={56} />
              <span className="game__player-name">{p1?.username || "Unknown"}</span>
              <span className="game__player-elo">
                Elo: {p1?.eloRating?.[`tc${tc}`] || "—"}
              </span>
            </div>
            <span className="game__vs">vs</span>
            <div className="game__player">
              <Avatar imageUrl={p2?.profileImageUrl} size={56} />
              <span className="game__player-name">{p2?.username || "Waiting..."}</span>
              <span className="game__player-elo">
                {p2 ? `Elo: ${p2?.eloRating?.[`tc${tc}`] || "—"}` : ""}
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

              {/* Betting controls — only shown to players during betting phase */}
              {phase === "betting" && isPlayer && (
                <div className="game__betting">
                  <p className="game__pot">
                    Pot: {pot} pts — Highest bet: {highestBet} pts
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
                      className="game__bet-btn"
                      onClick={() =>
                        send({ type: "bet", matchId: id, userId, amount: betAmount })
                      }
                    >
                      Bet
                    </button>
                    <button
                      className="game__bet-btn"
                      onClick={() =>
                        send({ type: "raise", matchId: id, userId, amount: betAmount })
                      }
                    >
                      Raise
                    </button>
                    <button
                      className="game__bet-btn"
                      onClick={() => send({ type: "match", matchId: id, userId })}
                    >
                      Match
                    </button>
                    <button
                      className="game__bet-btn game__bet-btn--fold"
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
            <form className="game__comment-form" onSubmit={handleComment}>
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
