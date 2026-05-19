import { getGamesList } from "../services/gameListService.js";
import { useAuth } from "./useAuth.js";
import { useState, useEffect } from "react";

/**
 * What needs to be done?
 *  Find only "Ongoing" games, with the highest elo players first e.g, we need to calculate the players inside the game so we can rank the games in descending order
 *  Display the variant of the game, username and the users elo.
 *  If under 5 currently running games, we show most recent passed games.
 *  If user clicks on a game "card" it should open the individual game
 */
export function useGamesList() {
  const [games, setGames] = useState([]);
  const [isGameLoading, setIsGameLoading] = useState(false);
  const [gameError, setGameError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;

    async function fetchGamesForHomepage() {
      try {
        setIsGameLoading(true);
        const data = await getGamesList();
        if (isMounted) {
          const ongoingGames = data.filter((game) => {
            if (game.status !== "Ongoing") return false;
            return user ? !game.isAnonymous : game.isAnonymous;
          });
          const finishedGames = data.filter((game) => {
            if (game.status !== "Finished") return false;
            return user ? !game.isAnonymous : game.isAnonymous;
          });

          ongoingGames.sort((highEloGame, notHighEloGame) => {
            // Find the highest elo game
            const highestEloGame = 
              (highEloGame.players[0]?.userId?.eloRating +
                highEloGame.players[1]?.userId?.eloRating) /
              2;
              //find the next highest elo game
            const notAsHighEloGame =
              (notHighEloGame.players[0]?.userId?.eloRating +
                notHighEloGame.players[1]?.userId?.eloRating) /
              2;
              // return the calculated elo's in descending order.
            return notAsHighEloGame - highestEloGame; 
          });

          let bestAvgOngoingGames = ongoingGames.slice(0, 5); // Slice it so we only see 5 at the time
          if(bestAvgOngoingGames.length < 5){
            const getFinishedGames = 5 - bestAvgOngoingGames.length;
            bestAvgOngoingGames = [...bestAvgOngoingGames,  ...finishedGames.slice(0, getFinishedGames)];
          }
          setGames(bestAvgOngoingGames);
        }
      } catch (err) {
        if (isMounted) {
          setGameError(err.message);
        }
      } finally {
        if (isMounted) {
          setIsGameLoading(false);
        }
      }
    }

    fetchGamesForHomepage();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return { games, isGameLoading, gameError };
}
