import { Game } from "../models/game.js";

// Retrieves all registered games with pagination
// Only returns registered users
// Pagination:
//   - page: Current page number
//   - limit: Number of games per page
export async function getAllGames(page, limit) {
  return await Game.find()
    .skip((page - 1) * limit)
    .limit(limit) // Return only the specified number of documents
    .populate("players.userId", "username eloRating")
    .lean(); // Return plain JavaScript objects instead of Mongoose documentsx
}

// gets a specified game from mongodb object id.
export async function getOneGame(id) {
  return await Game.findOne({ _id: id })
    .populate("players.userId", "username eloRating")
    .populate("comments")
    .lean();
}

// creates new game, and sends gamedata to controller,
export async function createGame(gameData) {
  const game = await new Game(gameData);
  return await game.save();
}

// updates data and sends the updated data to controller
export async function updateGame(id, updatedData) {
  return await Game.findByIdAndUpdate(
    id,
    { $set: updatedData },
    { new: true, runValidators: true },
  );
}
// checks if a player is registered or anonymous. If userId is not null, the player is registered
export function registeredOrAnonymous(players) {
  const anonymousPlayer = players.every((player) => player.userId == null); // null in userId in userSchema is anonymous user!
  const registeredUser = players.every((player) => player.userId != null); // Registered user

  if (!anonymousPlayer && !registeredUser) {
    throw new Error(
      "Anonymous players can only play against anonymous players, and registered users can only play against registered users!",
    );
  }
}

// checks if player is already in a game.
export async function isPlayerAvailable(players) {
  for (const player of players) {
    if (player.userId == null) continue; // We cant check anonymous players, so we skip those!

    const playerInActiveGame = await Game.findOne({
      "players.userId": player.userId,
      status: { $in: ["Upcoming", "Ongoing"] },
    });

    if (playerInActiveGame) {
      throw new Error(
        `${player.userId} is already in a game! Please finish this game before joining another one!`,
      );
    }
  }
}


export async function joinGame(gameId, userId){
  const game = await Game.findOne({_id: gameId});

  if(!game){
    throw new Error("Error: Game was not found");
  } 
  if(game.status !== "Upcoming"){
    throw new Error("Error: This gama has already started");
  }
  if(game.players.length >= 2){
    throw new Error("Error: Game is full");
  }

  const alreadyInGame = game.players.some(
    (player) => player.userId?.toString() === userId,
  );
  if(alreadyInGame){
    throw new Error("Error: You are already in this game!");
  }

  game.players.push({userId}); // Pushes the player into the game
  game.status = "Ongoing"; // Changes the status from upcoming to ongoing
  await game.save(); // Saves the changes
  return game;

}

export default {
  registeredOrAnonymous,
  isPlayerAvailable,
  getAllGames,
  getOneGame,
  createGame,
  updateGame,
  joinGame,
};
