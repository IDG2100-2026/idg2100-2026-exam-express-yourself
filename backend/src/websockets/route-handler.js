import User from "../models/User.js";
import { updateEloMultiplayer } from "../services/elo-service.js";
import { findRoundWinner } from "../services/match-service.js";
import { games, sendToRoom, getActivePlayers } from "./helpers.js";

export const endRound = async (match, matchId) => {
  const activePlayers = getActivePlayers(match);

  if (activePlayers.length === 1) {
    // if every player has folded except one player
    const winnerIndex = match.players.findIndex((player) => !player.hasFolded); // finding the player that has not folded
    match.players[winnerIndex].stack += match.pot; // the winner gets gets the points inside pot

    sendToRoom(matchId, {
      // sending message to the whole room
      type: "round:ended",
      reason: "Everyone folded",
      winnerIndex: [winnerIndex],
      pot: match.pot,
    });
  } else {
    const activeIndexes = []; // empty array to push the remaining players, must be 2 or more
    for (let i = 0; i < match.players.length; i++) {
      if (!match.players[i].hasFolded) {
        activeIndexes.push(i); // push remaining players to the array
      }
    }

    const { winners, hands } = findRoundWinner(
      // in match-service file
      activePlayers, // compare the hands of the active players.
      match.category.straightsAllowed,
    );

    const realWinnerIndexes = winners.map(
      (winnerIndex) => activeIndexes[winnerIndex],
    ); // finds the index of the winner. e.g, winners = [1] = player 2 won, or winners = [1, 2] = player 2 and 3 won
    const sharePot = Math.floor(match.pot / realWinnerIndexes.length); // shares the pot if we have multiple winners
    for (const winnerIndex of realWinnerIndexes) {
      match.players[winnerIndex].stack += sharePot; // gives the winners equal amount to the stack, and if there is one winner, it will / 1 which will be the same amount
    }

    sendToRoom(matchId, {
      type: "round:ended",
      reason: "showdown",
      winnerIndexes: winners,
      hands,
      pot: match.pot,
      players: match.players,
    });
  }

  match.pot = 0; // resets the pot
  match.highestBet = 0; // resets the highest bet
  match.currentRound += 1; // move to the next round

  if (match.currentRound > match.category.rounds) {
    return endGame(match, matchId); // end the game if current round is bigger than the round we set at the start
  }

  for (const player of match.players) {
    // game si not over, and we resets on a new round for the players to play a new round
    player.dice = [0, 0, 0, 0, 0]; // reset dice
    player.held = [false, false, false, false, false]; // reset dice held
    player.rollsUsed = 0; // reset rolls used
    player.hasFolded = false; // reset folded
    player.currentBet = 0; // no bet yet
    player.hasMatchedBet = false; // no matched bet yet
  }

  match.phase = "rolling"; // changing the phase back to rolling from betting
  match.currentPlayerIndex = 0; // first player index starting the rolling

  await match.save(); // save the match to db

  sendToRoom(matchId, {
    // msg to room that we start a new round
    type: "round:started",
    currentRound: match.currentRound,
    currentPlayerIndex: match.currentPlayerIndex,
  });
};

export const endGame = async (match, matchId) => {
  match.status = "completed"; // change status to know the game are done
  match.endedAt = Date.now(); // track when the match ended at

  let bestStack = 0; // assume the index 0 player has the best stack
  let winnerId = null; // 
  for (const player of match.players) {
    if (player.stack > bestStack) {
      // check if the current looped over player has more points than the current best stack holder
      bestStack = player.stack; // if true, the best stack variable is updated to the new player that has more points.
      winnerId = player.userId; // That player also becomes the winnerId
    }
  }
  match.winnerId = winnerId; // update the match winnerId to the winner we just found out

  for (const player of match.players) {
    await User.findByIdAndUpdate(player.userId, {
      // finds the user by userId and un
      $inc: { points: player.stack }, // updates the players now stack. e.g, if you won, you got more points
    });
  }

  const playerResult = match.players.map((player) => ({
    userId: player.userId,
    finalPoints: player.stack,
  }));
  await updateEloMultiplayer(playerResult, match.category?.timeControl || 10);

  await match.save(); // save changes to DB

  sendToRoom(matchId, {
    // send a message to all players that the game is over.
    type: "game:ended",
    players: match.players,
    winnerId: winnerId,
  });
};
