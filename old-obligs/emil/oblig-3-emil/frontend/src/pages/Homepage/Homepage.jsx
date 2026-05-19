import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import styles from "./Homepage.module.css";
import { useGamesList } from "../../hooks/useGamesList.js";
import { useLobbyList } from "../../hooks/useLobbyList.js";
import RegistrationForm from "../../components/RegistrationForm/RegistrationForm.jsx";
import { joinGame } from "../../services/gameLobbyService.js";
import { getGame } from "../../services/individualGame.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useNavigate } from "react-router";


export default function Homepage() {

  const { games, isGameLoading, gameError } = useGamesList(); // custom hook inside Hooks folder
  const { lobby, isLobbyLoading, lobbyError } = useLobbyList(); // Custom hook inside Hooks folder
  const [lobbyLimit, setLobbyLimit] = useState(5); // 5 games shown is default
  const [error, setError] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  function setUserPreferredLobbyGames(e) {
    // Helper function so we don't write the function inside the onChange
    setLobbyLimit(Number(e.target.value));
  }

  // Handles clicks to join a game as a player
  const handleJoinGameFromHomePage = async (gameId) => {
    try {
      setError(null);
      await joinGame(gameId, user);
      navigate(`/game/${gameId}`);
    } catch (err) {
      setError(err.message);
    }
  };


  // Handles clicks to view a game as a visitor
  const handleViewGameFromHomePage = async (gameId) => {
    try {
      setError(null);
      await getGame(gameId);
      navigate(`/game/${gameId}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className={styles.homepageWrapper}>
      {/*When clicking on a game card here, we are enrolled into the game and redirected to the game page! */}
      <article className={styles.briefMsgContainer}>
        <p className={styles.briefMsg}>
          Welcome to Spanish Dice Poker, the ultimate competitive dice platform where strategy meets luck. Create games, climb the Elo rankings, and compete to prove you're the best at the table. To get the most out of your experience, please {" "}
          <Link className={styles.registerBtn} to="/register">
            Register Here
          </Link>
        </p>
      </article>
      <section className={styles.lobbyPreviewWrapper}>
        <div className={styles.homepageHeading}>
          <span>Upcoming Games</span>
          <select
            className={styles.createGameButton}
            value={lobbyLimit}
            onChange={setUserPreferredLobbyGames}
          >
            <option value={3}>3 games</option>
            <option value={5}>5 games</option>
            <option value={7}>7 games</option>
          </select>
        </div>
        {isLobbyLoading ? (
          <p>Upcoming games is loading... Please be patient</p>
        ) : (
          lobby.slice(0, lobbyLimit).map((lobby) => {
            return (
              <Link key={lobby._id} className={styles.linkToGame}>
                <div
                  onClick={() => handleJoinGameFromHomePage(lobby._id)}
                  className={styles.gamesContainer}
                >
                  <div className={styles.gamesContent}>
                    <span className={styles.gamesPlayers}>
                      Player in game: {lobby.players[0]?.userId?.username}
                    </span>
                    <span>
                      Best of: {lobby.variant.rounds} | Seconds per round:{" "}
                      {lobby.variant.timeControl} | Straight-allowed:{" "}
                      {lobby.variant.straightAllowed ? "Yes" : "No"}
                    </span>
                    <span>
                      Elo Rating: {lobby.players[0]?.userId?.eloRating}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </section>

      {/*When clicking on a game card here, we are re directed to view the game! */}
      <section className={styles.gameListWrapper}>
        <div className={styles.homepageHeading}>
          <span>Ongoing Games</span>
          <Link className={styles.createGameButton} to="/create-game">
            Create game
          </Link>
        </div>
        {isGameLoading ? (
          <p>Ongoing games is loading... Please be patient</p>
        ) : (
          games.map((game) => {
            const avgElo = Math.round(
              (game.players[0]?.userId?.eloRating +
                game.players[1]?.userId?.eloRating) /
                2,
            );
            return (
              <Link key={game._id} className={styles.linkToGame}>
                <div onClick={() => handleViewGameFromHomePage(game._id)} className={styles.gamesContainer}>
                  <div className={styles.gamesContent}>
                    <span className={styles.gamesPlayers}>
                      {game.players[0]?.userId?.username} VS{" "}
                      {game.players[1]?.userId?.username}
                    </span>
                    <span>
                      Best of: {game.variant.rounds} | Seconds per round:{" "}
                      {game.variant.timeControl} | Straight-allowed:{" "}
                      {game.variant.straightAllowed ? "Yes" : "No"}
                    </span>
                    <span>Average Elo: {avgElo}</span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </section>
    </section>
  );
}
