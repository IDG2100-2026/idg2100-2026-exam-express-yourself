import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth.js";
import { createMatch } from "../../services/matches-service.js";
import styles from "./CreateGame.module.css";

export default function CreateGame() {
    const [bestOf, setBestOf] = useState(3);
    const [straightsAllowed, setStraightsAllowed] = useState(false);
    const [timeControl, setTimeControl] = useState(3);
    const [allowAnonymous, setAllowAnonymous] = useState(false);
    const [desiredOpponentElo, setDesiredOpponentElo] = useState("");
    const [error, setError] = useState(null);

    const auth = useAuth();
    const user = auth.user;
    const navigate = useNavigate();

    async function submitHandler(e) {
        e.preventDefault(); //stop browser from doing full page reload on submit
        try {
            const matchData = {
                playerOne: user._id, //logged in user becomes host
                bestOf: bestOf,
                straightsAllowed: straightsAllowed,
                timeControl: timeControl,
                allowAnonymous: allowAnonymous,
                status: "waiting" //new games start as waiting for a second player
            };
            const result = await createMatch(matchData); //backend return new match id
            navigate("/game/" + result._id); //send user to the game they created
        } catch (err) {
            setError(err.message);
        }
    }

    if (!user) {
        return (<p>You have to be logged in to create a game</p>);
    }

    return(
        <div className={styles["create-game"]}>
            <h1>Create game</h1>
            <form onSubmit={submitHandler} className={styles["create-game__form"]}>
                <div className={styles["create-game__field"]}>
                    <label htmlFor="bestOf">Best of:</label>
                    <select 
                        id="bestOf" 
                        onChange={(e) => {
                            setBestOf(Number(e.target.value)); //convert string to number
                        }}
                    >
                        <option value="3">3 rounds</option>
                        <option value="5">5 rounds</option>
                        <option value="7">7 rounds</option>
                    </select>
                </div>
                <div className={styles["create-game__field"]}>
                    <label htmlFor="straightsAllowed">Straights allowed:</label>
                    <input 
                        id="straightsAllowed" 
                        type="checkbox" 
                        checked={straightsAllowed} 
                        onChange={(e) => {
                            setStraightsAllowed(e.target.checked);
                        }}
                    />
                </div>
                <div className={styles["create-game__field"]}>
                    <label htmlFor="timeControl">Time per round:</label>
                    <select 
                        id="timeControl" 
                        onChange={(e) => {
                            setTimeControl(Number(e.target.value)); //convert string to number
                        }}
                    >
                        <option value="3">3 seconds</option>
                        <option value="10">10 seconds</option>
                        <option value="30">30 seconds</option>
                    </select>
                </div>
                <div className={styles["create-game__field"]}>
                    <label htmlFor="allowAnonymous">Allow anonymous player:</label>
                    <input 
                        id="allowAnonymous" 
                        type="checkbox" 
                        checked={allowAnonymous} 
                        onChange={(e) => {
                            setAllowAnonymous(e.target.checked);
                        }} 
                    />
                </div>
                <div className={styles["create-game__field"]}>
                    <label htmlFor="desiredOpponentElo">Desired opponent elo:</label>
                    <input
                        type="number"
                        id="desiredOpponentElo"
                        value={desiredOpponentElo}
                        onChange={(e) => {
                            setDesiredOpponentElo(e.target.value);
                        }}
                    />
                </div>
                <button type="submit">Create game</button>
            </form>
            {error ? (
                <p className={styles["create-game__error"]}>{error}</p>
            ) : (
                null
            )}
        </div>
    );
}
