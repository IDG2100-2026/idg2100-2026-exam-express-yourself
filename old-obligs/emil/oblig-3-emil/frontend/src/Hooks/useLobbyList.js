import { getGamesList } from "../services/gameListService.js";
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth.js";
export function useLobbyList() {
  const [lobby, setLobby] = useState([]);
  const [isLobbyLoading, setIsLobbyLoading] = useState(false);
  const [lobbyError, setLobbyError] = useState(null);
  const { user } = useAuth();
  /**
   * Hva må fikses her:
   *  Ha en endringsbar nummer av viste upcoming spill. Jeg tenker å ha ha en dropdown med 3, 5, og 7 games som vises og brukeren kan velge
   *  Når man trykker på spill kortet, så skal du automatisk bli sendt til individual game page og bli automatisk enrolled i det spillet (enrolled routen)
   *  Vise spill variantene, brukeren som allerede er inne i spillet og vise Elo ratingen.
   */

  useEffect(() => {
    let isMounted = true;
    async function fetchLobbyGames() {
      try {
        if (isMounted) {
          setIsLobbyLoading(true);
          const data = await getGamesList();
          const upcomingGames = data.filter((game) => {

            if (game.status !== "Upcoming") return false;
            if (user) {
              if (game.isAnonymous) return false; // So registered users don't see anonymous games

              const alreadyInGame = game.players.some(
                (player) => player.userId?._id === user.id
              );
              if(alreadyInGame) return false; // hides the game we created from the list to ourself!

              const elo = user.eloRating; // extracting user elo rating in a constant
              if (
                elo < game.eloRequirement?.min ||
                elo > game.eloRequirement?.max
              ) {
                return false; // if elo of the user is under the min requirement or over the maximum requirement those games are not shown!
              }
            } else {
              if (!game.allowAnonymousPlayers && !game.isAnonymous) {
                return false;
              }
            }
            return true;
          });
          setLobby(upcomingGames);
        }
      } catch (err) {
        if (isMounted) {
          setLobbyError(err.message);
        }
      } finally {
        if (isMounted) {
          setIsLobbyLoading(false);
        }
      }
    }

    fetchLobbyGames();
    // clean-up function
    return () => {
      isMounted = false;
    };
  }, [user]);
  return { lobby, isLobbyLoading, lobbyError };
}
