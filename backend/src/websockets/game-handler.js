import User from "../models/User.js";
import Match from "../models/Match.js";
import { updateEloMultiplayer } from "../services/elo-service.js";
import { rollDic, findRoundWinner } from "../services/match-service.js";
const games = new Map(); // keeps track of active game rooms, and their connected players


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
    default:
      console.log("Unknown message type", type);
  }
};

export const handleJoin = (socket, matchId, userId) => {
  // adds a players socket to the game room
  if (!games.has(matchId)) {
    // create a game room if its the first time a player enters e.g, newly cerated game
    games.set(matchId, []);
  }

  const room = games.get(matchId); // get a list of connected players
  room.push({ socket, userId }); // adds this players socket into this room

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
    (player) => player.userId.toString === userId,
  );

  if (playerIndex !== match.currentPlayerIndex)
    return sendError(socket, "Not your turn"); // not their turn

  const player = match.players[playerIndex]; // get players data from the match

  if (player.rollsUsed >= 3) {
    handleEndTurn(socket, matchId, userId); // auto end turn when player have rolled 3 times
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

export const handleHold = async (socket, userId, matchId, held) => {
  const match = await Match.findById(matchId); // finds the match
  if (!match) return sendError(socket, "Game not found");

  if (match.phase !== "rolling")
    return sendError(socket, "Not in rolling phase"); // check if game phase is in rolling

  const playerIndex = match.players.findIndex(
    (player) => player.userId.toString === userId, // finds whick index the player is
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

export const handleEndTurn = async (socket, userId, matchId) => {
  const match = await Match.findById(matchId); // finds the match
  if (!match) return sendError(socket, "Game not found");

  if (match.phase !== "rolling")
    return sendError(socket, "Not in rolling phase"); // check if game phase is in rolling

  const playerIndex = match.players.findIndex(
    // finds which index the user is
    (player) => player.userId.toString === userId,
  );

  if (playerIndex !== match.currentPlayerIndex)
    return sendError(socket, "Not your turn");

  const nextPlayerIndex = match.currentPlayerIndex + 1; // moved the index up by one to go to the next player

  if (nextPlayerIndex >= match.player.length) {
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

const handleBet = async (socket, userId, matchId, amount) => {
  const match = await Match.findById(matchId);
  if (!match) return sendError(socket, "Game not found");

  if (!match.phase === "betting")
    return sendError(socket, "Not in betting phase");

  const playerIndex = match.players.findIndex(
    // finds which index the user is
    (player) => player.userId.toString === userId,
  );

  if (playerIndex !== match.currentPlayerIndex)
    return sendError(socket, "Not your turn");

  const player = match.players[playerIndex]; // get players data

  if (amount > player.stack)
    return sendError(socket, "Not enough points to bet");

  ((player.stack -= amount), // removes points from players stack
    (player.currentBet += amount), // how much the player betted
    (player.hasMatchedBet = true), // user set the bet, so it is matched
    (match.pot += amount), // add bet to pot
    (match.highestBet = player.currentBet)); // this is the new bet to match

  for (const newMatchingBet of match.players) {
    // reset every active players hasMatchedBet to false, since there is a new bet.
    if (
      newMatchingBet.userId.toString() !== userId &&
      !newMatchingBet.hasFolded
    ) {
      newMatchingBet.hasMatchedBet = false;
    }
  }

  match.currentPlayerIndex = getNextBettingPlayer(match); // moves to the new player to bet

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

const endRound = async (match, matchId) => {
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

    const { winners, hands } = firstRoundWinner(
      // in match-service file
      activePlayers, // compare the hands of the active players.
      match.category.straightsAllowed,
    );

    const realWinnerIndexes = winners.map(
      (winnerIndex) => activeIndexes[winnerIndex],
    ); // finds the index of the winner. e.g, winners = [1] = player 2 won, or winners = [1, 2] = player 2 and 3 won
    const sharePot = Math.floor(match.pot / realWinnerIndexes.length); // shares the pot if we have multiple winners
    for (const winnerIndex of winners) {
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

  match.pot += 0; // resets the pot
  ((match.highestBet += 0), (match.currentRound += 1)); // resets the highest bet, and increment the round with one

  if (match.currentRound > match.category.rounds) {
    return endGame(match, matchId); // end the game if current round is bigger than the round we set at the start
  }

  for (const player of match.players) {
    // game si not over, and we resets on a new round for the players to play a new round
    player.dice = [0, 0, 0, 0, 0]; // reset dice
    ((player.held = [false, false, false, false, false]), // reset dice held
      (player.rollsUsed = 0)); // reset rolls used
    ((player.hasFolded = false), // reset folded
      (player.currentBet = 0), // no bet yet
      (player.hasMatchedBet = false)); // no matched bet yet
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

const endGame = async (match, matchId) => {
  match.status = "complete"; // change status to know the game are done
  match.endedAt = Date.now(); // track when the match ended at

  let bestStack = 0; // assume the index 0 player has the best stack
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
  await updateEloMultiplayer(playerResult);

  await match.save(); // save changes to DB

  sendToRoom(matchId, {
    // send a message to all players that the game is over.
    type: "game:ended",
    players: match.players,
    winnerId: winnerId,
  });
};
