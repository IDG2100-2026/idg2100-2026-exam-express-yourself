import { useEffect, useRef } from "react";
import { useGameWebSocket } from "../../hooks/useWebSockets.js";
import { useAuth } from "../../hooks/useAuth.js";
import "../web-components/dice-poker-die.js";

export const GameBoard = ({ matchId, userId }) => {
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

  return(
    <div>
        <p>Game board is loading....</p>
    </div>
  )
};

export default GameBoard;
