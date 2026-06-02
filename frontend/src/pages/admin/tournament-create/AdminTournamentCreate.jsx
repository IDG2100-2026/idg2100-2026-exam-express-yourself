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

  const [formData, setFormData] = useState(EMPTY_FORM);
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
        setFormData({
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
      setFormData((prev) => {
        return { ...prev, trophyImage: imageFile };
      });
    } else if (type === "checkbox") {
      setFormData((prev) => {
        return { ...prev, [name]: checked };
      });
    } else {
      setFormData((prev) => {
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
          title: formData.title,
          description: formData.description,
          startDate: formData.startDate,
          numberOfRounds: formData.numberOfRounds,
          buyIn: formData.buyIn,
          trophyTitle: formData.trophyTitle,
          category: {
            rounds: formData.rounds,
            timeControl: formData.timeControl,
            straightsAllowed: formData.straightsAllowed,
            buyIn: formData.categoryBuyIn,
          },
          eloRange: {
            min: formData.eloMin,
            max: formData.eloMax,
          },
        });
        navigate(`/tournament/${id}`);
      } else {
        const tournamentData = new FormData();
        tournamentData.append("title", formData.title);
        tournamentData.append("description", formData.description);
        tournamentData.append("startDate", formData.startDate);
        tournamentData.append("numberOfRounds", formData.numberOfRounds);
        tournamentData.append("category[rounds]", formData.rounds);
        tournamentData.append("category[timeControl]", formData.timeControl);
        tournamentData.append("category[straightsAllowed]", formData.straightsAllowed);
        tournamentData.append("category[buyIn]", formData.categoryBuyIn);
        tournamentData.append("buyIn", formData.buyIn);
        tournamentData.append("eloRange[min]", formData.eloMin);
        tournamentData.append("eloRange[max]", formData.eloMax);
        if (formData.trophyTitle) {
          tournamentData.append("trophyTitle", formData.trophyTitle);
        }
        if (formData.trophyImage) {
          tournamentData.append("trophyImage", formData.trophyImage);
        }
        const { tournament } = await createTournament(tournamentData);
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
    setError(null);

    if (!formData.title) {
      setError("Title is required.");
      return;
    }

    if (formData.title.length < 3 || formData.title.length > 64) {
      setError("Title must be between 3 and 64 characters.");
      return;
    }

    if (formData.description && (formData.description.length < 4 || formData.description.length > 500)) {
      setError("Description must be between 4 and 500 characters.");
      return;
    }

    if (!formData.startDate) {
      setError("Start date is required.");
      return;
    }

    const startDateObj = new Date(formData.startDate);

    if (startDateObj <= new Date()) {
      setError("Tournament's cannot be created with a start date back in time!");
      return;
    }

    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    if (startDateObj > oneYearFromNow) {
      setError("Tournament's cannot be created longer than one year in advance");
      return;
    }

    if (!formData.numberOfRounds || Number(formData.numberOfRounds) < 1) {
      setError("Number of rounds must be a positive integer.");
      return;
    }

    if (Number(formData.eloMin) < 0) {
      setError("Elo range minimum must be a non-negative integer.");
      return;
    }

    if (Number(formData.eloMax) < 0) {
      setError("Elo range maximum must be a non-negative integer.");
      return;
    }

    if (Number(formData.eloMax) < Number(formData.eloMin)) {
      setError("Elo max must be greater than or equal to elo min.");
      return;
    }

    if (formData.trophyTitle && formData.trophyTitle.trim() === "") {
      setError("Trophy title cannot be empty.");
      return;
    }

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

      <form noValidate className="admin-tc__form stack-m" onSubmit={handleSubmit}>
        <div className="admin-tc__field">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div className="admin-tc__field">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="admin-tc__field">
          <label htmlFor="startDate">Start date & time *</label>
          <input
            id="startDate"
            name="startDate"
            type="datetime-local"
            value={formData.startDate}
            onChange={handleChange}
          />
        </div>

        <div className="admin-tc__field">
          <label htmlFor="numberOfRounds">Number of tournament rounds *</label>
          <input
            id="numberOfRounds"
            name="numberOfRounds"
            type="number"
            value={formData.numberOfRounds}
            onChange={handleChange}
          />
        </div>

        <div className="admin-tc__row">
          <div className="admin-tc__field">
            <label htmlFor="rounds">Game rounds</label>
            <select
              id="rounds"
              name="rounds"
              value={formData.rounds}
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
              value={formData.timeControl}
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
            checked={formData.straightsAllowed}
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
              value={formData.categoryBuyIn}
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
              value={formData.buyIn}
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
              value={formData.eloMin}
              onChange={handleChange}
            />
          </div>
          <div className="admin-tc__field">
            <label htmlFor="eloMax">Max Elo</label>
            <input
              id="eloMax"
              name="eloMax"
              type="number"
              value={formData.eloMax}
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
              value={formData.trophyTitle}
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

        {error && <p className="admin-tc__error">{error}</p>}
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
