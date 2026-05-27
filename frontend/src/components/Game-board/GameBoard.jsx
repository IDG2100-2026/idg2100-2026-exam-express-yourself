import { useEffect, useRef, useState } from "react";
import { useGameWebSocket } from "../../hooks/useWebSockets.js";
import { useAuth } from "../../hooks/useAuth.js";
import "../web-components/dice-poker-die.js";
import "../web-components/dice-poker-board.js";

export const GameBoard = ({ matchId, userId }) => {
  const boardRef = useRef(null); // reference to dice-poker-board component. Bridge between
  const [held, setHeld] = useState([false, false, false, false, false,]); // tracks which dices are held
  const {
    gameState,
    error,
    sendRoll,
    sendHold,
    sendEndTurn,
    sendBet,
    sendRaise,
    sendMatch,
    sendFold,
  } = useGameWebSocket(matchId, userId);

  useEffect(() => {
    // watches for web socket messages, and passes the data to the board component
    if (!gameState || !boardRef.current) return; // skip if no data or no board
    const board = boardRef.current; // get the board web component

    if (gameState.type === "dice:rolled") {
      board.updateState({
        players: gameState.players, // update player data including new dice values
      });
    }

    if (gameState.type === "turn:changed") {
      // new players turn or phase change
      board.updateState({
        currentPlayerIndex: gameState.currentPlayerIndex, // whose turn
        phase: gameState.phase, // rolling or betting
      });
    }
    if (gameState === "bet:placed" || gameState === "bet:matched") {
      // someone placed a bet or matched a current bet
      board.updateState({
        pot: gameState.pot, // updated total pot
        highestBet: gameState.highestBet, // current bet to match
      });
    }
    if (gameState === "round:started") {
      // new round is starting
      board.updateState({
        currentRound: gameState.currentRound, // updates round number
        currentPlayerIndex: gameState.currentPlayerIndex, // who starts rolling
        phase: "rolling", // always starts in rolling phase
      });
    }
    if (gameState === "round:ended") {
      // round is over and show everyones dices
      board.updateState({
        players: gameState.players, // all players data with dice is revealed
        phase: "reveal", // show the dice to everyone
      });
    }
  }, [gameState]);

  useEffect(() => {
    const board = boardRef.current; // reference to board component
    if (!board) return; // skip if board is not mounted

    const onRoll = () => sendRoll();
    const endTurn = () => sendEndTurn();
    const onBet = () => sendBet();
    const onRaise = () => sendRaise();
    const onMatch = () => sendMatch();
    const onFold = () => sendFold();

    board.addEventListener("board:roll", onRoll);
    board.addEventListener("board:endTurn", endTurn);
    board.addEventListener("board:bet", onBet);
    board.addEventListener("board:raise", onRaise);
    board.addEventListener("board:match", onMatch);
    board.addEventListener("board:fold", onFold);

    return () => {
      board.removeEventListener("board:roll", onRoll);
      board.removeEventListener("board:endTurn", endTurn);
      board.removeEventListener("board:bet", onBet);
      board.removeEventListener("board:raise", onRaise);
      board.removeEventListener("board:match", onMatch);
      board.removeEventListener("board:fold", onFold);
    };
  }, [sendRoll, sendEndTurn, sendBet, sendRaise, sendMatch, sendFold]); // re-render if any of these functions changes
  return (
    <div className="game-board">
      <dice-poker-board ref={boardRef}></dice-poker-board>
      {error && <p>{error}</p>}
    </div>
  );
};

export default GameBoard;
