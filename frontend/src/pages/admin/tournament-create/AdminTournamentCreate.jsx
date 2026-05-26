import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createTournament, updateTournament, getTournament } from "../../../services/tournaments-service.js";
import "./admin-tournament-create.scss";

const EMPTY_FORM = {
  title: "",
  description: "",
  rules: "",
  startDate: "",
  numberOfRounds: 1,
  rounds: 3,
  timeControl: 10,
  straightsAllowed: true,
  buyIn: 0,
  eloMin: 0,
  eloMax: 9999,
  trophyTitle: "",
  trophyImage: null,
};

export default function AdminTournamentCreate() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getTournament(id)
      .then((t) => {
        setForm({
          title: t.title || "",
          description: t.description || "",
          rules: t.rules || "",
          startDate: t.startDate ? t.startDate.slice(0, 16) : "",
          numberOfRounds: t.numberOfRounds || 1,
          rounds: t.category?.rounds || 3,
          timeControl: t.category?.timeControl || 10,
          straightsAllowed: t.category?.straightsAllowed ?? true,
          buyIn: t.buyIn || 0,
          eloMin: t.eloRange?.min || 0,
          eloMax: t.eloRange?.max || 9999,
          trophyTitle: t.trophy?.title || "",
          trophyImage: null,
        });
      })
      .catch((err) => setError(err.message));
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setForm((prev) => ({ ...prev, trophyImage: files[0] || null }));
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isEdit) {
        await updateTournament(id, {
          title: form.title,
          description: form.description,
          rules: form.rules,
          startDate: form.startDate,
        });
        navigate(`/tournament/${id}`);
      } else {
        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("rules", form.rules);
        formData.append("startDate", form.startDate);
        formData.append("numberOfRounds", form.numberOfRounds);
        formData.append("category[rounds]", form.rounds);
        formData.append("category[timeControl]", form.timeControl);
        formData.append("category[straightsAllowed]", form.straightsAllowed);
        formData.append("buyIn", form.buyIn);
        formData.append("eloRange[min]", form.eloMin);
        formData.append("eloRange[max]", form.eloMax);
        if (form.trophyTitle) formData.append("trophyTitle", form.trophyTitle);
        if (form.trophyImage) formData.append("trophyImage", form.trophyImage);

        const tournament = await createTournament(formData);
        navigate(`/tournament/${tournament._id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-tc">
      <h1 className="admin-tc__title">{isEdit ? "Edit Tournament" : "Create Tournament"}</h1>

      {error && <p className="admin-tc__error">{error}</p>}

      <form className="admin-tc__form" onSubmit={handleSubmit}>
        <div className="admin-tc__field">
          <label htmlFor="title">Title *</label>
          <input id="title" name="title" type="text" value={form.title} onChange={handleChange} required />
        </div>

        <div className="admin-tc__field">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={3} value={form.description} onChange={handleChange} />
        </div>

        <div className="admin-tc__field">
          <label htmlFor="rules">Rules</label>
          <textarea id="rules" name="rules" rows={4} value={form.rules} onChange={handleChange} />
        </div>

        <div className="admin-tc__field">
          <label htmlFor="startDate">Start Date & Time *</label>
          <input id="startDate" name="startDate" type="datetime-local" value={form.startDate} onChange={handleChange} required />
        </div>

        {!isEdit && (
          <>
            <div className="admin-tc__field">
              <label htmlFor="numberOfRounds">Number of Tournament Rounds *</label>
              <input id="numberOfRounds" name="numberOfRounds" type="number" min={1} max={10} value={form.numberOfRounds} onChange={handleChange} required />
            </div>

            <div className="admin-tc__row">
              <div className="admin-tc__field">
                <label htmlFor="rounds">Game Rounds</label>
                <select id="rounds" name="rounds" value={form.rounds} onChange={handleChange}>
                  <option value={3}>Best of 3</option>
                  <option value={5}>Best of 5</option>
                  <option value={7}>Best of 7</option>
                </select>
              </div>

              <div className="admin-tc__field">
                <label htmlFor="timeControl">Time Control</label>
                <select id="timeControl" name="timeControl" value={form.timeControl} onChange={handleChange}>
                  <option value={10}>10 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={90}>90 seconds</option>
                </select>
              </div>
            </div>

            <div className="admin-tc__field admin-tc__field--checkbox">
              <input id="straightsAllowed" name="straightsAllowed" type="checkbox" checked={form.straightsAllowed} onChange={handleChange} />
              <label htmlFor="straightsAllowed">Straights allowed</label>
            </div>

            <div className="admin-tc__row">
              <div className="admin-tc__field">
                <label htmlFor="buyIn">Buy-in (points)</label>
                <select id="buyIn" name="buyIn" value={form.buyIn} onChange={handleChange}>
                  <option value={0}>Free</option>
                  <option value={1}>1 point</option>
                  <option value={10}>10 points</option>
                  <option value={50}>50 points</option>
                </select>
              </div>
            </div>

            <div className="admin-tc__row">
              <div className="admin-tc__field">
                <label htmlFor="eloMin">Min Elo</label>
                <input id="eloMin" name="eloMin" type="number" min={0} value={form.eloMin} onChange={handleChange} />
              </div>
              <div className="admin-tc__field">
                <label htmlFor="eloMax">Max Elo</label>
                <input id="eloMax" name="eloMax" type="number" min={0} value={form.eloMax} onChange={handleChange} />
              </div>
            </div>

            <div className="admin-tc__row">
              <div className="admin-tc__field">
                <label htmlFor="trophyTitle">Trophy Title</label>
                <input id="trophyTitle" name="trophyTitle" type="text" value={form.trophyTitle} onChange={handleChange} />
              </div>
              <div className="admin-tc__field">
                <label htmlFor="trophyImage">Trophy Image</label>
                <input id="trophyImage" name="trophyImage" type="file" accept="image/*" onChange={handleChange} />
              </div>
            </div>
          </>
        )}

        <div className="admin-tc__actions">
          <button type="submit" className="admin-tc__submit" disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Tournament"}
          </button>
        </div>
      </form>
    </div>
  );
}
