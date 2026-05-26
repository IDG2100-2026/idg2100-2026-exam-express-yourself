import { useState, useEffect, useCallback, useRef } from "react";
const { VITE_BACKEND_HOSTNAME, VITE_BACKEND_PORT } = import.meta.env;

const WS_URL = `ws://${VITE_BACKEND_HOSTNAME}:${VITE_BACKEND_PORT}`;

export const useGameWebSocket = (matchId, userId) => {
  const socketRef = useRef(null); // so react does not re-render on every socket change!
  const [gameState, setGameState] = useState(null); // stores the messages e.g, dice rolled turn change
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!matchId || !userId) return; // don't connect if we don't have game or player
    const socket = new WebSocket(WS_URL); // Opens a new websocket connection to backend
    socketRef.current = socket; // stores the socket in the ref so other functions can use it

    socket.onopen = () => {
      // fires when connection is successful
      socket.send(
        JSON.stringify({
          // send a join message to backend
          type: "join", // this tells the switch case on backend this is a join action
          matchId, // which game to join
          userId, // who joined
        }),
      );
    };

    socket.onmessage = (event) => {
      // fires when the server sends a message
      const message = JSON.parse(event.data); // parse the json string to an object. Data since that is what we used in websockets on backend

      if (message.type === "error") {
        // if the server sent an error message
        setError(message.message); // store the error message in the error state
        return; // stop here, don't move to setGameSate
      }

      setGameState(message); // store message in state so component can use it
    };

    return () => {
      socket.close(); // close the connection when players leaves
    };
  }, [matchId, userId]); // re-run this useEffect if match or player changes

  const sendRoll = useCallback(() => {
    // useCallback to remember the function, and prevent re-renders on every re-render
    socketRef.current?.send(
      JSON.stringify({
        // sends a msg trough socket connection
        type: "roll", // tells the backend this is a roll case action
        matchId, // which game it is
        userId, // who the user is
      }),
    );
  }, [matchId, userId]); // only recreate the function if matchId or userId changes

  const sendBet = useCallback(
    (amount) => {
      // fires when a user bets, and has an amount parameter for how much the bet was
      socketRef.current?.send(
        JSON.stringify({
          // sends a msg trough socket connection
          type: "bet", // tells backend this is a bet case actions
          matchId, // which game
          userId, // who are making the bet
          amount, // amount the user betted
        }),
      );
    },
    [matchId, userId],
  ); // recreate function only on matchId and userId change!

  const sendHold = useCallback(
    (held) => {
      socketRef.current?.send(
        JSON.stringify({
          type: "hold", // tells backend this is a hold case actions
          matchId, // which game
          userId, // who are making the hold
          held, // what dices the user held
        }),
      );
    },
    [matchId, userId],// recreate function only on matchId and userId change!
  );

  const sendEndTurn = useCallback(() => {
    socketRef.current?.send(
      JSON.stringify({
        type: "endTurn", // tells backend this is a endTurn case actions
        matchId, // which game
        userId, // who are ending their turn
      }),
    );
  }, [matchId, userId]);

  const sendRaise = useCallback(
    (amount) => {
      socketRef.current?.send(
        JSON.stringify({
          type: "raise", // tells backend this is a raise case actions
          matchId, // which game
          userId, // who are raising a bet
          amount, // amount the user raised with 
        }),
      );
    },
    [matchId, userId], // recreate function only on matchId and userId change!
  );

  const sendMatch = useCallback(() => {
    socketRef.current?.send(
      JSON.stringify({
        type: "match", // tells backend this is a match case actions
        matchId, // which game
        userId, // who are matching a bet
      }),
    );
  }, [matchId, userId]); // recreate function only on matchId and userId change!

  const sendFold = useCallback(() => {
    socketRef.current?.send(
      JSON.stringify({
        type: "fold", // tells backend this is a fold case actions
        matchId, // which game
        userId, // who are folding
      }),
    );
  }, [matchId, userId]); // recreate function only on matchId and userId change!

  return {
    gameState,
    error,
    sendRoll,
    sendHold,
    sendEndTurn,
    sendBet,
    sendRaise,
    sendMatch,
    sendFold,
  };
};
