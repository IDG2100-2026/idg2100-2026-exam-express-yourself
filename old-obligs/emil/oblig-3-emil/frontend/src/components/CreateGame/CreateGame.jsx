import styles from "./CreateGame.module.css";
import { createGame } from "../../services/createGame.js";
import { useState } from "react";
import { data, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth.js";

const ELO_BRACKET = [
  { label: "Under 1500", min: 0, max: 1499 },
  { label: "1500 - 1999", min: 1500, max: 1999 },
  { label: "2000 - 2499", min: 2000, max: 2499 },
  { label: "2500 - 2999", min: 2500, max: 2999 },
  { label: "3000 - 3499", min: 3000, max: 3499 },
  { label: "3500 - 4000", min: 3500, max: 4000 },
];

export default function CreateGame() {
  const [formData, setFormData] = useState({
    rounds: 5,
    straightAllowed: true,
    timeControl: 10,
    allowAnonymousPlayers: false,
    eloBracket: 0,
  }); // This is default. User can change when creating game.
  const [error, setError] = useState(null); // State for setting error
  const [isSubmitting, setIsSubmitting] = useState(false); // state for disable button when submitting
  const [isLoading, setIsLoading] = useState(false); // State for loading, so we can have a spinner
  const [createGameSuccess, setCreateGameSuccess] = useState(false); // State for giving success msg to user
  const navigate = useNavigate();
  const { user } = useAuth(); // To see if the user is registered or not, if so, they can choose to not include anonymous players

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      setIsLoading(true);
      const bracket = ELO_BRACKET[formData.eloBracket];
      
      const gameDetails = {
        variant: {
          rounds: formData.rounds,
          straightAllowed: formData.straightAllowed,
          timeControl: formData.timeControl,
        },
        eloRequirement: {
          min: bracket.min,
          max: bracket.max,
        },
        allowAnonymousPlayers: formData.allowAnonymousPlayers,
      };

      const createdGamePage = await createGame(gameDetails, user);

      setCreateGameSuccess(true);
      setTimeout(() => {
        navigate(`/game/${createdGamePage.game._id}`);
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.createGameForm} onSubmit={handleSubmit}>
      <section className={styles.createGameContainer}>
        <h1>Create Game</h1>
        {
          // if successful login, we display the success msg, else we display the error msg at the top in red,
          createGameSuccess ? (
            <p className={styles.createGameConfirmation}>
              Create game successful! You will be redirected to the game
            </p>
          ) : (
            <p className={styles.createGameErrorMsg}>{error}</p>
          )
        }
        <label htmlFor="rounds">Best of rounds</label>
        <select
          name="rounds"
          id="rounds"
          className={styles.createGameBestOf}
          value={formData.rounds}
          onChange={handleChange}
        >
          <option value={3}>3 Rounds</option>
          <option value={5}>5 Rounds</option>
          <option value={7}>7 Rounds</option>
        </select>
        <label htmlFor="timeControl">Seconds per round</label>
        <select
          name="timeControl"
          id="timeControl"
          value={formData.timeControl}
          onChange={handleChange}
        >
          <option value={3}>3 Seconds</option>
          <option value={10}>10 Seconds</option>
          <option value={30}>30 Seconds</option>
        </select>
        <label htmlFor="eloBracket">
          What Elo bracket do you want to play against?
        </label>
        <select
          name="eloBracket"
          id="eloBracket"
          value={formData.eloBracket}
          onChange={handleChange}
        >
          {ELO_BRACKET.map((bracket, index) => (
            <option key={index} value={index}>
              {bracket.label}
            </option>
          ))}
        </select>
        {user && <span>Your Elo rating is: {user.eloRating}</span>}{" "}
        {/*If we have a logged in user, we display their Elo, so they know what bracket they want to play against */}
        <div className={styles.createGameCheckbox}>
          <label htmlFor="straightAllowed">Include straight hand</label>
          <input
            name="straightAllowed"
            id="straightAllowed"
            type="checkbox"
            checked={formData.straightAllowed}
            onChange={handleChange}
          />
        </div>
        {/* If we have a logged in user, they can choose if a anonymous player can join their game or not */}
        {user && (
          <div className={styles.createGameCheckbox}>
            <label htmlFor="allowAnonymousPlayers">
              Allow anonymous players to join?
            </label>
            <input
              type="checkbox"
              name="allowAnonymousPlayers"
              id="allowAnonymousPlayers"
              value={formData.allowAnonymousPlayers}
              onChange={handleChange}
            />
          </div>
        )}
        <div>
          <button className={styles.createGameButton} disabled={isSubmitting}>
            {" "}
            {/* Button is disabled when isSubmitting = true */}
            {isSubmitting ? "Submitting...." : "Submit"}
          </button>
        </div>
      </section>
    </form>
  );
}
