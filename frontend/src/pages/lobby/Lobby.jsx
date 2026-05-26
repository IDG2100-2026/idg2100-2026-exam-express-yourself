import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMatches, joinMatch } from "../../services/matches-service.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useAppearance } from "../../hooks/useAppearance.js";
import Avatar from "../../components/avatar/Avatar.jsx";
import "./lobby.scss";

const TIME_CONTROLS = [10, 30, 90];
const ROUNDS_OPTIONS = [3, 5, 7];

function sortMatches(matches, sort) {
  if (sort === "elo_desc")
    return [...matches].sort(
      (a, b) =>
        (b.players?.[0]?.userId?.eloRating || 0) -
        (a.players?.[0]?.userId?.eloRating || 0),
    );
  if (sort === "elo_asc")
    return [...matches].sort(
      (a, b) =>
        (a.players?.[0]?.userId?.eloRating || 0) -
        (b.players?.[0]?.userId?.eloRating || 0),
    );
  return matches;
}

export default function Lobby() {
  const [matches, setMatches] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [timeControl, setTimeControl] = useState(null);
  const [rounds, setRounds] = useState(null);
  const [sort, setSort] = useState("newest");

  const { user } = useAuth();
  const { appearance } = useAppearance();
  const navigate = useNavigate();
  const limit = appearance.lobbySize;

  const userId = user?._id || user?.userId;

  function excludeOwn(results) {
    return (results || []).filter((m) => {
      const p1Id = m.players?.[0]?.userId?._id || m.players?.[0]?.userId;
      return p1Id !== userId;
    });
  }

  // Reset and reload whenever filters or page size changes
  useEffect(() => {
    let stale = false;
    setIsLoading(true);
    setPage(1);
    getMatches({ status: "waiting", timeControl, rounds, page: 1, limit })
      .then((data) => {
        if (stale) return;
        setMatches(excludeOwn(data.results));
        setTotal(data.total || 0);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!stale) { setError(err.message); setIsLoading(false); }
      });
    return () => { stale = true; };
  }, [timeControl, rounds, limit, userId]);

  function loadMore() {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    getMatches({ status: "waiting", timeControl, rounds, page: nextPage, limit })
      .then((data) => {
        setMatches((prev) => [...prev, ...excludeOwn(data.results)]);
        setTotal(data.total || 0);
        setPage(nextPage);
        setIsLoadingMore(false);
      })
      .catch(() => setIsLoadingMore(false));
  }

  async function handleJoin(match) {
    try { await joinMatch(match._id); } catch { /* proceed to game */ }
    navigate(`/game/${match._id}`);
  }

  const displayed = sortMatches(matches, sort);
  const hasMore = matches.length < total;

  return (
    <div className="lobby">
      <div className="lobby__header">
        <h1 className="lobby__title">Game Lobby</h1>
        <Link to="/create-game" className="lobby__create">+ New Game</Link>
      </div>

      <div className="lobby__filters">
        <div className="lobby__filter-group">
          <span className="lobby__filter-label">Time</span>
          <div className="lobby__filter-btns">
            <button
              className={`lobby__filter-btn${timeControl === null ? " lobby__filter-btn--active" : ""}`}
              onClick={() => setTimeControl(null)}
            >All</button>
            {TIME_CONTROLS.map((t) => (
              <button
                key={t}
                className={`lobby__filter-btn${timeControl === t ? " lobby__filter-btn--active" : ""}`}
                onClick={() => setTimeControl(t)}
              >{t}s</button>
            ))}
          </div>
        </div>

        <div className="lobby__filter-group">
          <span className="lobby__filter-label">Rounds</span>
          <div className="lobby__filter-btns">
            <button
              className={`lobby__filter-btn${rounds === null ? " lobby__filter-btn--active" : ""}`}
              onClick={() => setRounds(null)}
            >All</button>
            {ROUNDS_OPTIONS.map((r) => (
              <button
                key={r}
                className={`lobby__filter-btn${rounds === r ? " lobby__filter-btn--active" : ""}`}
                onClick={() => setRounds(r)}
              >BO{r}</button>
            ))}
          </div>
        </div>

        <div className="lobby__filter-group">
          <span className="lobby__filter-label">Sort</span>
          <select
            className="lobby__sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="elo_desc">Elo: High → Low</option>
            <option value="elo_asc">Elo: Low → High</option>
          </select>
        </div>
      </div>

      {isLoading && <p className="lobby__status">Loading games...</p>}
      {error && <p className="lobby__error">{error}</p>}
      {!isLoading && !error && displayed.length === 0 && (
        <p className="lobby__status">No open games match your filters.</p>
      )}

      <div className="lobby__grid">
        {displayed.map((match) => {
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
                <span>{match.category?.timeControl}s</span>
              </div>
              <div className="lobby__card-waiting">Join game →</div>
            </button>
          );
        })}
      </div>

      {hasMore && (
        <div className="lobby__load-more">
          <button
            className="lobby__load-more-btn"
            onClick={loadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
