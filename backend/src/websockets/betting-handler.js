import Match from "../models/Match.js";

import {
  sendError,
  sendToRoom,
  getActivePlayers,
  getNextBettingPlayer,
} from "./helpers.js";
import { endRound } from "./route-handler.js"; // TODO: not yet done

export const handleBet = async (socket, userId, matchId, amount) => {
  const match = await Match.findById(matchId);
  if (!match) return sendError(socket, "Game not found");

  if (match.phase !== "betting")
    return sendError(socket, "Not in betting phase");

  const playerIndex = match.players.findIndex(
    // finds which index the user is
    (player) => player.userId.toString() === userId,
  );

  if (playerIndex !== match.currentPlayerIndex)
    return sendError(socket, "Not your turn");

  const player = match.players[playerIndex]; // get players data

  if (amount > player.stack)
    return sendError(socket, "Not enough points to bet");

  player.stack -= amount; // removes points from players stack
  player.currentBet += amount; // how much the player betted
  player.hasMatchedBet = true; // user set the bet, so it is matched
  match.pot += amount; // add bet to pot
  match.highestBet = player.currentBet; // this is the new bet to match

  for (const newMatchingBet of match.players) {
    // reset every active players hasMatchedBet to false, since there is a new bet.
    if (
      newMatchingBet.userId.toString() !== userId &&
      !newMatchingBet.hasFolded
    ) {
      newMatchingBet.hasMatchedBet = false;
    }
  }

  sendToRoom(matchId, {
    type: "bet:placed",
    playerIndex,
    amount,
    pot: match.pot,
    highestBet: match.highestBet,
  });

  if (getActivePlayers(match).length === 1) {
    return endRound(match, matchId);
  }

  match.currentPlayerIndex = getNextBettingPlayer(match); // move to the next player

  await match.save();

  sendToRoom(matchId, {
    type: "turn:changed",
    currentPlayerIndex: match.currentPlayerIndex,
  });
};
