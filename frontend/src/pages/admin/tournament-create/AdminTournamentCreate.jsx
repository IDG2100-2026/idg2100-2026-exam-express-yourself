import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  createTournament,
  updateTournament,
  getTournament,
} from "../../../services/tournaments-service.js";
import ConfirmModal from "../../../components/confirm-modal/ConfirmModal.jsx";

const EMPTY_FORM = {
  title: "",
  description: "",
  startDate: "",
  numberOfRounds: 1,
  rounds: 3,
  timeControl: 10,
  straightsAllowed: true,
  categoryBuyIn: 1,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    getTournament(id)
      .then((tournament) => {
        let title = "";
        if (tournament.title) {
          title = tournament.title;
        }
        let description = "";
        if (tournament.description) {
          description = tournament.description;
        }
        let startDate = "";
        if (tournament.startDate) {
          startDate = tournament.startDate.slice(0, 16);
        }
        let numberOfRounds = 1;
        if (tournament.numberOfRounds) {
          numberOfRounds = tournament.numberOfRounds;
        }
        let rounds = 3;
        if (tournament.category?.rounds) {
          rounds = tournament.category.rounds;
        }
        let timeControl = 10;
        if (tournament.category?.timeControl) {
          timeControl = tournament.category.timeControl;
        }
        const straightsAllowed = tournament.category?.straightsAllowed ?? true;
        let categoryBuyIn = 1;
        if (tournament.category?.buyIn) {
          categoryBuyIn = tournament.category.buyIn;
        }
        let buyIn = 0;
        if (tournament.buyIn) {
          buyIn = tournament.buyIn;
        }
        let eloMin = 0;
        if (tournament.eloRange?.min) {
          eloMin = tournament.eloRange.min;
        }
        let eloMax = 9999;
        if (tournament.eloRange?.max) {
          eloMax = tournament.eloRange.max;
        }
        let trophyTitle = "";
        if (tournament.trophy?.title) {
          trophyTitle = tournament.trophy.title;
        }
        setForm({
          title,
          description,
          startDate,
          numberOfRounds,
          rounds,
          timeControl,
          straightsAllowed,
          categoryBuyIn,
          buyIn,
          eloMin,
          eloMax,
          trophyTitle,
          trophyImage: null,
        });
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      let imageFile = null;
      if (files[0]) {
        imageFile = files[0];
      }
      setForm((prev) => {
        return { ...prev, trophyImage: imageFile };
      });
    } else if (type === "checkbox") {
      setForm((prev) => {
        return { ...prev, [name]: checked };
      });
    } else {
      setForm((prev) => {
        return { ...prev, [name]: value };
      });
    }
  }

  async function doSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await updateTournament(id, {
          title: form.title,
          description: form.description,
          startDate: form.startDate,
          numberOfRounds: form.numberOfRounds,
          buyIn: form.buyIn,
          trophyTitle: form.trophyTitle,
          category: {
            rounds: form.rounds,
            timeControl: form.timeControl,
            straightsAllowed: form.straightsAllowed,
            buyIn: form.categoryBuyIn,
          },
          eloRange: {
            min: form.eloMin,
            max: form.eloMax,
          },
        });
        navigate(`/tournament/${id}`);
      } else {
        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("startDate", form.startDate);
        formData.append("numberOfRounds", form.numberOfRounds);
        formData.append("category[rounds]", form.rounds);
        formData.append("category[timeControl]", form.timeControl);
        formData.append("category[straightsAllowed]", form.straightsAllowed);
        formData.append("category[buyIn]", form.categoryBuyIn);
        formData.append("buyIn", form.buyIn);
        formData.append("eloRange[min]", form.eloMin);
        formData.append("eloRange[max]", form.eloMax);
        if (form.trophyTitle) {
          formData.append("trophyTitle", form.trophyTitle);
        }
        if (form.trophyImage) {
          formData.append("trophyImage", form.trophyImage);
        }
        const { tournament } = await createTournament(formData);
        navigate(`/tournament/${tournament._id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (isEdit) {
      doSubmit();
    } else {
      setConfirmModal({
        message: "Create this tournament?",
        onConfirm: async () => {
          setConfirmModal(null);
          await doSubmit();
        },
      });
    }
  }

  let pageTitle = "Create tournament";
  if (isEdit) {
    pageTitle = "Edit tournament";
  }

  let submitLabel = "Create tournament";
  if (isSubmitting) {
    submitLabel = "Saving...";
  } else if (isEdit) {
    submitLabel = "Save changes";
  }

  return (
    <div className="admin-tc stack-l">
      <h1>{pageTitle}</h1>

      {error && <p className="admin-tc__error">{error}</p>}

      <form className="admin-tc__form stack-m" onSubmit={handleSubmit}>
        <div className="admin-tc__field">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="admin-tc__field">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="admin-tc__field">
          <label htmlFor="startDate">Start date & time *</label>
          <input
            id="startDate"
            name="startDate"
            type="datetime-local"
            value={form.startDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="admin-tc__field">
          <label htmlFor="numberOfRounds">Number of tournament rounds *</label>
          <input
            id="numberOfRounds"
            name="numberOfRounds"
            type="number"
            min={1}
            max={10}
            value={form.numberOfRounds}
            onChange={handleChange}
            required
          />
        </div>

        <div className="admin-tc__row">
          <div className="admin-tc__field">
            <label htmlFor="rounds">Game rounds</label>
            <select
              id="rounds"
              name="rounds"
              value={form.rounds}
              onChange={handleChange}
            >
              <option value={3}>Best of 3</option>
              <option value={5}>Best of 5</option>
              <option value={7}>Best of 7</option>
            </select>
          </div>
          <div className="admin-tc__field">
            <label htmlFor="timeControl">Time control</label>
            <select
              id="timeControl"
              name="timeControl"
              value={form.timeControl}
              onChange={handleChange}
            >
              <option value={10}>10 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={90}>90 seconds</option>
            </select>
          </div>
        </div>

        <div className="admin-tc__field admin-tc__field--checkbox">
          <input
            id="straightsAllowed"
            name="straightsAllowed"
            type="checkbox"
            checked={form.straightsAllowed}
            onChange={handleChange}
          />
          <label htmlFor="straightsAllowed">Straights allowed</label>
        </div>

        <div className="admin-tc__row">
          <div className="admin-tc__field">
            <label htmlFor="categoryBuyIn">
              Match buy-in (points per game)
            </label>
            <select
              id="categoryBuyIn"
              name="categoryBuyIn"
              value={form.categoryBuyIn}
              onChange={handleChange}
            >
              <option value={1}>1 point</option>
              <option value={10}>10 points</option>
              <option value={50}>50 points</option>
            </select>
          </div>
          <div className="admin-tc__field">
            <label htmlFor="buyIn">Tournament entry fee (points)</label>
            <select
              id="buyIn"
              name="buyIn"
              value={form.buyIn}
              onChange={handleChange}
            >
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
            <input
              id="eloMin"
              name="eloMin"
              type="number"
              min={0}
              value={form.eloMin}
              onChange={handleChange}
            />
          </div>
          <div className="admin-tc__field">
            <label htmlFor="eloMax">Max Elo</label>
            <input
              id="eloMax"
              name="eloMax"
              type="number"
              min={0}
              value={form.eloMax}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="admin-tc__row">
          <div className="admin-tc__field">
            <label htmlFor="trophyTitle">Trophy title</label>
            <input
              id="trophyTitle"
              name="trophyTitle"
              type="text"
              value={form.trophyTitle}
              onChange={handleChange}
            />
          </div>
          {!isEdit && (
            <div className="admin-tc__field">
              <label htmlFor="trophyImage">Trophy image</label>
              <input
                id="trophyImage"
                name="trophyImage"
                type="file"
                accept="image/*"
                onChange={handleChange}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn--primary"
          disabled={isSubmitting}
        >
          {submitLabel}
        </button>
      </form>

      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => { setConfirmModal(null); }}
        />
      )}
    </div>
  );
}
