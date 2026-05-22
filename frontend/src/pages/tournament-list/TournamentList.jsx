import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTournaments } from "../../services/tournaments-service.js";

export default function TournamentList() {
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stale = false;
    async function fetchTournaments() {
      try {
        const data = await getTournaments();
        if (!stale) setTournaments(data.results || []);
      } catch (err) {
        if (!stale) setError(err.message);
      } finally {
        if (!stale) setIsLoading(false);
      }
    }
    fetchTournaments();
    return () => { stale = true; };
  }, []);

  return (
    <div className="tournaments">
      <h1 className="tournaments__title">Tournaments</h1>
      {isLoading && <p className="tournaments__status">Loading tournaments...</p>}
      {error && <p className="tournaments__error">{error}</p>}
      {!isLoading && !error && tournaments.length === 0 && <p className="tournaments__status">No tournaments found.</p>}
      <div className="tournaments__grid">
        {tournaments.map((t) => (
          <Link to={`/tournament/${t._id}`} key={t._id} className="tournaments__card">
            <span className="tournaments__card-status">{t.status}</span>
            <h2 className="tournaments__card-title">{t.title}</h2>
            <p className="tournaments__card-date">{new Date(t.startDate).toLocaleDateString()}</p>
            <p className="tournaments__card-players">{t.participants?.length || 0} players signed up</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
