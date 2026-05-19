import gameServices from "../services/gameServices.js";
import { updateEloRating } from "../services/eloService.js";
import { joinMatchQueue } from "../services/matchmakingService.js";
export async function getGames(req, res) {
  try {
    const page = parseInt(req.query.page) || 1; // if no query page is specified, 1 is default
    const limit = parseInt(req.query.limit) || 10; // if no query limit is specified, 10 is default.
    const allGames = await gameServices.getAllGames(page, limit); // Gets all games from db from services.

    if (!allGames) {
      return res.status(404).json({ Error: "Could not find any games" }); // 404 status code if game does not exist!
    }
    return res.status(200).json(allGames); // returns all games
  } catch (err) {
    return res.status(500).json({ Error: err.message });
  }
}

// Gets a game from specified game MongoDB id
export async function getAGame(req, res) {
  try {
    const gameId = req.params.id;
    const gameObj = await gameServices.getOneGame(gameId);

    if (!gameObj) {
      return res
        .status(404)
        .json({ Error: "Could not find the game with id", gameId });
    }
    return res.status(200).json({ ...gameObj });
  } catch (err) {
    return res.status(500).json({ Error: err.message });
  }
}

export async function createAGame(req, res) {
  try {
    const userType = req.headers["user-type"]; // All user types can create games
    const isAnonymous = userType === "anonymous";
    const userId = isAnonymous ? null : req.headers["user-id"]; // anonymous users has null in the schema, so this is specified here.

    if (req.body.eloRequirement) { // We check if the request body contains this, if so it is a game creation trough the create game form
      const { variant, eloRequirement, allowAnonymousPlayers } = req.body;
      const game = await gameServices.createGame({
        players: [{ userId }], // Player that makes the game, is in, the second player will be joined from lobby or lobby preview.
        variant,
        eloRequirement,
        allowAnonymousPlayers: isAnonymous ? true : allowAnonymousPlayers, // if the player is anonymous, it is forced to true, of not, registered player can choose 
        isAnonymous,
        status: "Upcoming",
      });

      return res.status(201).json({ Message: "Game created", game });
    }


    const { variant } = req.body; // checks what variants the user want to create.
    const eloRating = isAnonymous ? null : Number(req.headers["user-elo"]);

    const result = await joinMatchQueue(
      userId,
      eloRating,
      variant,
      isAnonymous,
    );

    if (result.status === "matched") {
      return res
        .status(200)
        .json({ Message: "Match found!", game: result.game }); // When 2 players join the same game, this gets returned.
    }
    return res
      .status(200)
      .json({ Message: "Waiting for opponent...", status: "waiting" }); // When only one player is in a game
  } catch (err) {
    return res.status(500).json({ Error: err.message });
  }
}

export async function updateGame(req, res) {
  try {
    const { id } = req.params; // Game id to be updated.
    const updatedGame = await gameServices.updateGame(id, req.body);

    if (!updatedGame) {
      return res.status(404).json({ Error: "Game was not found" });
    }
    console.log("isAnonymous:", updatedGame.isAnonymous);
    console.log("outcome:", updatedGame.outcome);
    console.log("players:", updatedGame.players);

    if (!updatedGame.isAnonymous && updatedGame.outcome?.winner) {
      const players = updatedGame.players;
      const winner = updatedGame.outcome.winner.toString();
      const loser = players
        .find((player) => player.userId.toString() !== winner)
        .userId.toString();

      await updateEloRating(winner, loser, updatedGame.outcome.draw);
    }

    return res.status(200).json({ Message: `Game is updated: ${updatedGame}` });
  } catch (err) {
    return res.status(500).json({ Error: err.message });
  }
}


export async function joinAGame(req, res){
  try{
    const { id } = req.params;
    const userId = req.headers["user-id"] || null;

    const game = await gameServices.joinGame(id, userId);
    return res.status(200).json({Message: "Join the game", game });
  }catch(err){
    return res.status(400).json({Error: err.message});
  }
}

export default {
  getGames,
  getAGame,
  createAGame,
  updateGame,
  joinAGame,
};
