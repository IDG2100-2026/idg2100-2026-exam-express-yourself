export const games = new Map(); // keep track of active games and active players

export const sendError = (socket, errorMessage) => {
  socket.send(
    JSON.stringify({
      // sends error message to a room
      type: "error",
      message: errorMessage,
    }),
  );
};

// helper function
export const sendToPlayer = (socket, data) => {
  socket.send(JSON.stringify(data)); // sends a message to a player
};
// helper function
export const sendToRoom = (matchId, data) => {
  const room = games.get(matchId); // finds the game
  if (!room) return;

  for (const player of room) {
    player.socket.send(JSON.stringify(data)); // sends every player a message that is in this game
  }
};

// helper function
export const getNextBettingPlayer = (match) => {
  let nextIndex = match.currentPlayerIndex + 1; // increment index by one

  for (let i = 0; i < match.players.length; i++) {
    const checkIndex = (nextIndex + i) % match.players.length; // calculate which players to check. Goes back to start if we passed the last player
    const player = match.players[checkIndex]; // get the players data to check if they have folded or not

    if (!player.hasFolded && !player.hasMatchedBet) {
      return checkIndex; // skips players that have hasFolded: true and hasMatchedBet: true
    }
  }

  return -1; // fallback if something happens and every player has folded. keeps the game from crashing
};

// helper function
export const isBettingOver = (match) => {
  // check if all players have folded or matched the highest bet
  for (const player of match.players) {
    if (player.hasFolded) continue; // skip over folded players
    if (!player.hasMatchedBet) return false;
  }
  return true; // everyone has folded or matched bet
};

// helper function
export const getActivePlayers = (match) => {
  // get the players that have not folded
  return match.players.filter((player) => !player.hasFolded);
};
