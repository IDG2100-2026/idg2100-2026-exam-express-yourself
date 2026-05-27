import Match from "../models/Match.js";
import { rollDice } from "../services/match-service.js";
import { sendError, games, sendToPlayer, sendToRoom } from "./helpers.js";
import {
  handleBet,
  handleMatchedBet,
  handleFolding,
} from "./betting-handler.js";

export const handleGameMessage = (socket, message) => {
  const { type, matchId, userId } = message; // extract what kind of action, game and user

  switch (
    type // check the action type and call the right handler
  ) {
    case "join": // player wants to join a game room
      handleJoin(socket, matchId, userId);
      break;
    case "roll": // player want to roll their dices
      handleRoll(socket, matchId, userId);
      break;
    case "hold": // player want to hold a dice
      handleHold(socket, matchId, userId, message.held);
      break;
    case "endTurn":
      handleEndTurn(socket, matchId, userId);
      break;
    case "bet":
      handleBet(socket, matchId, userId, message.amount);
      break;
    case "raise":
      handleBet(socket, matchId, userId, message.amount, true);
      break;
    case "match":
      handleMatchedBet(socket, matchId, userId);
      break;
    case "fold":
      handleFolding(socket, matchId, userId);
      break;
    default:
      console.log("Unknown message type", type);
  }
};

export const handleJoin = async (socket, matchId, userId) => {
  // adds a players socket to the game room
  if (!games.has(matchId)) {
    // create a game room if its the first time a player enters e.g, newly cerated game
    games.set(matchId, []);
  }

  const room = games.get(matchId); // get a list of connected players

  const existingIndex = room.findIndex((player) => player.userId === userId); // seaching the room for an existing connection from the same user because of strict mode in react
  if (existingIndex !== -1) {
    // if found, remove old connection
    room.splice(existingIndex, 1); // removes the old entry connection
  }
  room.push({ socket, userId }); // adds this players socket into this room

  // Check if the game has started and all players are connected via WebSocket
  const match = await Match.findById(matchId);
  if (match && match.status === "in-progress") {
    // Check if every player in the match has a WebSocket connection in the room
    const allConnected = match.players.every((player) =>
      room.some((connection) => connection.userId === player.userId.toString()),
    );
    
    console.log("Match status:", match.status);
    console.log("Players in match:", match.players.length);
    console.log("Players in room:", room.length);
    console.log(
      "Room userIds:",
      room.map((c) => c.userId),
    );
    console.log(
      "Match userIds:",
      match.players.map((p) => p.userId.toString()),
    );

    if (allConnected) {
      // Tell everyone the game is starting
      sendToRoom(matchId, {
        type: "game:started",
        players: match.players,
        currentPlayerIndex: match.currentPlayerIndex,
        phase: match.phase,
        currentRound: match.currentRound,
        totalRounds: match.category.rounds,
      });
    }
  }
  console.log(
    `Player ${userId} joined game ${matchId}. Players in room: ${room.length}`,
  );
};

export const handleRoll = async (socket, matchId, userId) => {
  const match = await Match.findById(matchId); // finds the match
  if (!match) return sendError(socket, "Game not found"); // error if no match

  if (match.phase !== "rolling")
    return sendError(socket, "Not in rolling phase"); // check if game phase is in rolling

  const playerIndex = match.players.findIndex(
    // find which player index the user is
    (player) => player.userId.toString() === userId,
  );

  if (playerIndex !== match.currentPlayerIndex)
    return sendError(socket, "Not your turn"); // not their turn

  const player = match.players[playerIndex]; // get players data from the match

  if (player.rollsUsed >= 3) {
    return handleEndTurn(socket, matchId, userId); // auto end turn when player have rolled 3 times
  }

  player.dice = rollDice(player.dice, player.held); //roll the dices, and hold the held dices
  player.rollsUsed += 1; // every roll, we use up a rollUsed

  await match.save();

  sendToPlayer(socket, {
    // sends message to user
    type: "dice:rolled",
    dice: player.dice,
    rollsUsed: player.rollsUsed,
  });

  sendToRoom(matchId, {
    // sends message to thw whole room
    type: "player:rolled",
    playerIndex,
    rollsUsed: player.rollsUsed,
  });
};

export const handleHold = async (socket, matchId, userId, held) => {
  const match = await Match.findById(matchId); // finds the match
  if (!match) return sendError(socket, "Game not found");

  if (match.phase !== "rolling")
    return sendError(socket, "Not in rolling phase"); // check if game phase is in rolling

  const playerIndex = match.players.findIndex(
    (player) => player.userId.toString() === userId, // finds whick index the player is
  );

  if (playerIndex !== match.currentPlayerIndex)
    return sendError(socket, "Not your turn");

  const player = match.players[playerIndex]; // get players data

  player.held = held; // update which dice the player is holding

  await match.save();

  sendToPlayer(socket, {
    // confirm back to player
    type: "dice:held",
    held: player.held,
  });

  sendToRoom(matchId, {
    type: "player:held",
    playerIndex,
  });
};

export const handleEndTurn = async (socket, matchId, userId) => {
  const match = await Match.findById(matchId); // finds the match
  if (!match) return sendError(socket, "Game not found");

  if (match.phase !== "rolling")
    return sendError(socket, "Not in rolling phase"); // check if game phase is in rolling

  const playerIndex = match.players.findIndex(
    // finds which index the user is
    (player) => player.userId.toString() === userId,
  );

  if (playerIndex !== match.currentPlayerIndex)
    return sendError(socket, "Not your turn");

  const nextPlayerIndex = match.currentPlayerIndex + 1; // moved the index up by one to go to the next player

  if (nextPlayerIndex >= match.players.length) {
    // checks if every player has rolled
    match.phase = "betting";
    match.currentPlayerIndex = 0; // player index 0 starts betting
  } else {
    match.currentPlayerIndex = nextPlayerIndex; // move to next player
  }

  await match.save();

  sendToRoom(matchId, {
    type: "turn:changed",
    phase: match.phase,
    currentPlayerIndex: match.currentPlayerIndex,
  });
};
