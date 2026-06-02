import { useState } from "react";
import { useNavigate } from "react-router";
import { createMatch } from "../../services/matches-service.js";
import { useAuth } from "../../hooks/useAuth.js";

function OptionGroup({ label, options, selected, onChange }) {
  return (
    <div className="create__group stack-s">
      <p className="create__group-label">{label}</p>
      <div className="create__options">
        {options.map((opt) => {
          let buttonClass = "btn btn--secondary";
          if (selected === opt.value) {
            buttonClass = "btn btn--secondary create__option--active";
          }
          return (
            <button key={String(opt.value)} type="button" className={buttonClass} onClick={() => { onChange(opt.value); }}>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CreateGame() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    rounds: 3,
    straightsAllowed: true,
    timeControl: 10,
    maxPlayers: 2,
    buyIn: 1,
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(key, value) {
    setFormData((prev) => {
      return { ...prev, [key]: value };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await createMatch(formData);
      const matchId = result?.match?._id || result?._id;
      navigate(`/game/${matchId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="create stack-m">
      <h1>Create a new game</h1>

      <form className="create__form stack-m" onSubmit={handleSubmit}>
        <h2>Choose your settings</h2>

        <OptionGroup label="Best of" options={[{ label: "Best of 3", value: 3 }, { label: "Best of 5", value: 5 }, { label: "Best of 7", value: 7 }]} selected={formData.rounds} onChange={(v) => { updateField("rounds", v); }} />
        <OptionGroup label="Straights rule" options={[{ label: "Straights allowed", value: true }, { label: "No straights", value: false }]} selected={formData.straightsAllowed} onChange={(v) => { updateField("straightsAllowed", v); }} />
        <OptionGroup label="Time control (total seconds)" options={[{ label: "10 seconds", value: 10 }, { label: "30 seconds", value: 30 }, { label: "90 seconds", value: 90 }]} selected={formData.timeControl} onChange={(v) => { updateField("timeControl", v); }} />
        <OptionGroup label="Number of players" options={[{ label: "2 players", value: 2 }, { label: "3 players", value: 3 }, { label: "5 players", value: 5 }]} selected={formData.maxPlayers} onChange={(v) => { updateField("maxPlayers", v); }} />
        {user && (
          <OptionGroup label="Buy-in (points)" options={[{ label: "1 point", value: 1 }, { label: "10 points", value: 10 }, { label: "50 points", value: 50 }]} selected={formData.buyIn} onChange={(v) => { updateField("buyIn", v); }} />
        )}

        {error && <p className="create__error">{error}</p>}
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create game"}
        </button>
      </form>
    </div>
  );
}
