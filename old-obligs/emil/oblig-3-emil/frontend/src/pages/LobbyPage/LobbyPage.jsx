import { useLobbyList } from "../../hooks/useLobbyList";
import styles from './LobbyPage.module.css';
import { joinGame } from "../../services/gameLobbyService";
import { useNavigate } from "react-router";
import { useAuth } from '../../hooks/useAuth.js';
import { useState } from "react";
export default function Lobby() {
const { lobby, isLobbyLoading, lobbyError } = useLobbyList();
const { user } = useAuth()
const [ error, setError ] = useState(null);
const navigate = useNavigate();



    const handleJoinGame = async (gameId) => {
        try{
            setError(null); // resets the error msg if we had an error, and tried again
            await joinGame(gameId, user);
            navigate(`/game/${gameId}`) // Navigates to the joined game
        }catch(err){
            setError(err.message);
        }
    }
    return(
        <section className={styles.lobbyWrapper}>
            <div className={styles.lobbyHeading}>
                <h1>Joinable Games</h1>
            </div>

            {isLobbyLoading ? (
                <p>Joinable games is loading...</p>
            ) : (
                lobby.map((game, index) => {
                    return(
                        <div className={styles.lobbyPageGameContainer} key={index}>
                            <div className={styles.lobbyPageGameContent}>
                                <span>Player to clash against: {game.players[0]?.userId?.username || "Anonymous"}</span>
                                <span>Best of rounds: {game.variant.rounds} | Seconds per round: {game.variant.timeControl} | Straight hand allowed: {game.variant.straightAllowed ? "Yes" : "No"}</span>
                                <span>Opponent's Elo Rating: {game.players[0]?.userId?.eloRating}</span>
                                <button onClick={() => handleJoinGame(game._id)} type="submit">Join game</button>
                                {error && <p>{error}</p>}
                            </div>
                        </div>
                    )
                })
            )}
        </section>
    )
}

<span className={styles.boldTxt}></span>
