import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMatches, joinMatch } from "../../services/matches-service.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useAppearance } from "../../hooks/useAppearance.js";
import Avatar from "../../components/avatar/Avatar.jsx";

export default function Lobby() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { appearance } = useAppearance();
  const navigate = useNavigate();

  useEffect(() => {
    let stale = false;
    async function fetchMatches() {
      try {
        const data = await getMatches("waiting");
        if (stale) return;
        const userId = user?._id || user?.userId;
        const visible = (data.results || []).filter((m) => {
          const p1Id = m.players?.[0]?.userId?._id || m.players?.[0]?.userId;
          return p1Id !== userId;
        });
        setMatches(visible);
      } catch (err) {
        if (!stale) setError(err.message);
      } finally {
        if (!stale) setIsLoading(false);
      }
    }
    fetchMatches();
    return () => { stale = true; };
  }, [user]);

  async function handleJoin(match) {
    try { await joinMatch(match._id); } catch (err) { /* proceed */ }
    navigate(`/game/${match._id}`);
  }

  return (
    <div className="lobby">
      <div className="lobby__header">
        <h1 className="lobby__title">Game Lobby</h1>
        <Link to="/create-game" className="lobby__create">+ New Game</Link>
      </div>
      {isLoading && <p className="lobby__status">Loading games...</p>}
      {error && <p className="lobby__error">{error}</p>}
      {!isLoading && !error && matches.length === 0 && (
        <p className="lobby__status">No open games right now. Be the first!</p>
      )}
      <div className="lobby__grid">
        {matches.slice(0, appearance.lobbySize).map((match) => {
          const p1 = match.players?.[0]?.userId;
          return (
            <button key={match._id} className="lobby__card" onClick={() => handleJoin(match)}>
              <div className="lobby__card-player">
                <Avatar imageUrl={p1?.profileImageUrl} size={40} />
                <div>
                  <div>{p1?.username || "Unknown"}</div>
                  <div className="lobby__card-elo">Elo {p1?.eloRating || "?"}</div>
                </div>
              </div>
              <div className="lobby__card-variant">
                <span>Best of {match.category?.rounds}</span>
                <span>{match.category?.straightsAllowed ? "Straights" : "No straights"}</span>
                <span>{match.category?.timeControl}s total</span>
              </div>
              <div className="lobby__card-waiting">Join game →</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
