import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMatch } from "../../services/matches-service.js";
import { useAuth } from "../../hooks/useAuth.js";

function OptionGroup({ label, options, selected, onChange }) {
  return (
    <div className="create__group">
      <p className="create__group-label">{label}</p>
      <div className="create__options">
        {options.map((opt) => (
          <button key={String(opt.value)} type="button" className={`create__option ${selected === opt.value ? "create__option--selected" : ""}`} onClick={() => onChange(opt.value)}>
            {opt.label}
          </button>
        ))}
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
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await createMatch(formData);
      const matchId = result?.match?._id || result?._id;
      if (matchId) navigate(`/game/${matchId}`);
      else setError("Game created but could not navigate.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="create">
      <h1 className="create__title">Create a New Game</h1>
      <p className="create__subtitle">Choose your settings. You will be Player 1.</p>

      <form className="create__form" onSubmit={handleSubmit}>
        <OptionGroup label="Best of" options={[{ label: "Best of 3", value: 3 }, { label: "Best of 5", value: 5 }, { label: "Best of 7", value: 7 }]} selected={formData.rounds} onChange={(v) => updateField("rounds", v)} />
        <OptionGroup label="Straights rule" options={[{ label: "Straights allowed", value: true }, { label: "No straights", value: false }]} selected={formData.straightsAllowed} onChange={(v) => updateField("straightsAllowed", v)} />
        <OptionGroup label="Time control (total seconds)" options={[{ label: "10 seconds", value: 10 }, { label: "30 seconds", value: 30 }, { label: "90 seconds", value: 90 }]} selected={formData.timeControl} onChange={(v) => updateField("timeControl", v)} />
        <OptionGroup label="Number of players" options={[{ label: "2 players", value: 2 }, { label: "3 players", value: 3 }, { label: "5 players", value: 5 }]} selected={formData.maxPlayers} onChange={(v) => updateField("maxPlayers", v)} />
        {user && (
          <OptionGroup label="Buy-in (points)" options={[{ label: "1 point", value: 1 }, { label: "10 points", value: 10 }, { label: "50 points", value: 50 }]} selected={formData.buyIn} onChange={(v) => updateField("buyIn", v)} />
        )}
        {error && <p className="create__error">{error}</p>}
        <button type="submit" className="create__submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Game"}
        </button>
      </form>
    </div>
  );
}
