import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPlayerMatches } from "../../services/matches-service.js";

export default function AllGames() {
  const { id } = useParams();
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stale = false;
    async function fetchMatches() {
      try {
        const data = await getPlayerMatches(id);
        if (!stale) setMatches(data.results || []);
      } catch (err) {
        if (!stale) setError(err.message);
      } finally {
        if (!stale) setIsLoading(false);
      }
    }
    fetchMatches();
    return () => { stale = true; };
  }, [id]);

  return (
    <div className="allgames">
      <div className="allgames__header">
        <h1 className="allgames__title">All Games</h1>
        <Link to={`/profile/${id}`} className="allgames__back">← Back to profile</Link>
      </div>
      {isLoading && <p className="allgames__status">Loading...</p>}
      {error && <p className="allgames__error">{error}</p>}
      {!isLoading && !error && matches.length === 0 && <p className="allgames__status">No games found.</p>}
      <div className="allgames__list">
        {matches.map((match) => {
          const won = match.winnerId?._id === id || match.winnerId === id;
          const opponent = (match.players || []).find((p) => {
            const pId = p.userId?._id || p.userId;
            return pId !== id;
          })?.userId;
          return (
            <Link to={`/game/${match._id}`} key={match._id} className="allgames__row">
              <span className={`allgames__result allgames__result--${match.status === "completed" ? (won ? "win" : "loss") : match.status}`}>
                {match.status === "completed" ? (won ? "Win" : "Loss") : match.status}
              </span>
              <span className="allgames__opponent">vs {opponent?.username || "Unknown"}</span>
              <span className="allgames__variant">Best of {match.category?.rounds} — {match.category?.timeControl}s</span>
              <span className="allgames__date">{new Date(match.updatedAt).toLocaleDateString()}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
