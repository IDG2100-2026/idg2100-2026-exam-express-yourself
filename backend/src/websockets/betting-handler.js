import Match from "../models/Match.js";

import {
  sendError,
  sendToRoom,
  getActivePlayers,
  getNextBettingPlayer,
  isBettingOver,
} from "./helpers.js";
import { endRound } from "./route-handler.js"; // TODO: not yet done

export const handleBet = async (
  socket,
  matchId,
  userId,
  amount,
  isRaise = false,
) => {
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

  if (isRaise && player.currentBet + amount <= match.highestBet) {
    // if isRaise is true, we check if the bet is equal or less than the highest
    return sendError(socket, "Raise must be higher than the current bet");
  }

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

export const handleMatchedBet = async (socket, matchId, userId) => {
  const match = await Match.findById(matchId); // finds the game
  if (!match) return sendError(socket, "Game not found");

  if (match.phase !== "betting")
    return sendError(socket, "Not in betting phase!"); // if the phase is in rolling for example, player cannot bet yet

  const playerIndex = match.players.findIndex(
    (player) => player.userId.toString() === userId, // finds which index the user is
  );

  if (playerIndex !== match.currentPlayerIndex)
    return sendError(socket, "Not your turn to bet"); // if the current player is not the player making the request, they get error

  const player = match.players[playerIndex]; // get the player data

  const betDifference = match.highestBet - player.currentBet; // calculates how much the player needs to bet to match the bet
  if (betDifference > player.stack)
    return sendError(socket, "Not enough point to match the bet!"); // if the player cannot afford to match bet

  player.stack -= betDifference; // removes the bet difference from their stack! e.g, if player has betted 4 earlier, and now it is 10, the and user matches it removes 6 since that is the difference
  player.currentBet = match.highestBet; // is user matches, it sets highest bet since it matches the highest bet
  player.hasMatchedBet = true; // sets it to true, so the user don't have to bet again (unless someone raises the bet)
  match.pot += betDifference; // adds the difference to the pot.

  sendToRoom(matchId, {
    type: "bet:matched",
    playerIndex,
    amount: betDifference,
    pot: match.pot,
  });

  if (isBettingOver(match)) {
    // check if every player has matched bet or folded, needs to be at least 2 players
    return endRound(match, matchId); // if true, we end the round
  }

  if (getActivePlayers(match).length === 1) {
    // check if all players except one folded
    return endRound(match, matchId); // if so, we call the end round function
  }

  match.currentPlayerIndex = getNextBettingPlayer(match); // if none of the if statements above is true, we are still betting, and we call the next player to bet

  await match.save();

  sendToRoom(matchId, {
    type: "turn:changed",
    currentPlayerIndex: match.currentPlayerIndex,
  });
};

export const handleFolding = async (socket, matchId, userId) => {
  const match = await Match.findById(matchId); // finds the game
  if (!match) return sendError(socket, "Game not found");

  if (match.phase !== "betting")
    return sendError(socket, "Not in betting phase!"); // if the phase is in rolling for example, player cannot bet yet

  const playerIndex = match.players.findIndex(
    (player) => player.userId.toString() === userId, // finds which index the user is
  );

  if (playerIndex !== match.currentPlayerIndex)
    return sendError(socket, "Not your turn to bet"); // if the current player is not the player making the request, they get error

  const player = match.players[playerIndex]; // get the player data

  player.hasFolded = true; // the player folds, and get this to to true so the betting and check who wins the round skips this user

  sendToRoom(matchId, {
    type: "player:folded",
    playerIndex,
  });

  if (getActivePlayers(match).length === 1) {
    // check if all players except one folded
    return endRound(match, matchId); // if so, we call the end round function
  }

  if (isBettingOver(match)) {
    // check if every player has matched bet or folded, needs to be at least 2 players
    return endRound(match, matchId); // if true, we end the round
  }

  match.currentPlayerIndex = getNextBettingPlayer(match); // if none of the if statements above is true, we are still betting, and we call the next player to bet

  await match.save();

  sendToRoom(matchId, {
    type: "turn:changed",
    currentPlayerIndex: match.currentPlayerIndex,
  });
};
