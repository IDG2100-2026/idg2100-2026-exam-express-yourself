import { useState, useEffect } from "react";
import { Link } from "react-router";
import { getMatches, joinMatch } from "../../services/matches-service.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useAppearance } from "../../hooks/useAppearance.js";
import Avatar from "../../components/avatar/Avatar.jsx";

const TIME_CONTROLS = [10, 30, 90];
const ROUNDS_OPTIONS = [3, 5, 7];

function getHostElo(match, tc) {
  const elo = match.players?.[0]?.userId?.eloRating;
  return elo?.[`tc${tc || 10}`] || elo?.tc10 || 0;
}

function sortMatches(matches, sort, tc) {
  if (sort === "elo_desc")
    return [...matches].sort((a, b) => getHostElo(b, tc) - getHostElo(a, tc));
  if (sort === "elo_asc")
    return [...matches].sort((a, b) => getHostElo(a, tc) - getHostElo(b, tc));
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
  const [straights, setStraights] = useState(null);
  const [sort, setSort] = useState("newest");

  const { user } = useAuth();
  const { appearance } = useAppearance();
  const limit = appearance.lobbySize;

  const userId = user?._id || user?.userId;

  useEffect(() => {
    let stale = false;
    setIsLoading(true);
    setPage(1);
    getMatches({ status: "waiting", timeControl, rounds, straightsAllowed: straights, page: 1, limit })
      .then((data) => {
        if (stale) return;
        setMatches(data.results || []);
        setTotal(data.total || 0);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!stale) { setError(err.message); setIsLoading(false); }
      });
    return () => { stale = true; };
  }, [timeControl, rounds, straights, limit, userId]);

  function loadMore() {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    getMatches({ status: "waiting", timeControl, rounds, straightsAllowed: straights, page: nextPage, limit })
      .then((data) => {
        setMatches((prev) => [...prev, ...(data.results || [])]);
        setTotal(data.total || 0);
        setPage(nextPage);
        setIsLoadingMore(false);
      })
      .catch(() => setIsLoadingMore(false));
  }

  const displayed = sortMatches(matches, sort, timeControl);
  const hasMore = page * limit < total;

  return (
    <div className="lobby stack-l">
      <div className="lobby__header">
        <h1>Lobby</h1>
        <Link to="/create-game" className="btn btn--primary">+ Create game</Link>
      </div>

      <div className="lobby__filters">
        <div className="lobby__filter-group">
          <span className="lobby__filter-label">Time</span>
          <div className="lobby__filter-btns">
            <button className={`lobby__filter-btn${timeControl === null ? " lobby__filter-btn--active" : ""}`} onClick={() => setTimeControl(null)}>All</button>
            {TIME_CONTROLS.map((t) => (
              <button key={t} className={`lobby__filter-btn${timeControl === t ? " lobby__filter-btn--active" : ""}`} onClick={() => setTimeControl(t)}>{t}s</button>
            ))}
          </div>
        </div>

        <div className="lobby__filter-group">
          <span className="lobby__filter-label">Rounds</span>
          <div className="lobby__filter-btns">
            <button className={`lobby__filter-btn${rounds === null ? " lobby__filter-btn--active" : ""}`} onClick={() => setRounds(null)}>All</button>
            {ROUNDS_OPTIONS.map((r) => (
              <button key={r} className={`lobby__filter-btn${rounds === r ? " lobby__filter-btn--active" : ""}`} onClick={() => setRounds(r)}>BO{r}</button>
            ))}
          </div>
        </div>

        <div className="lobby__filter-group">
          <span className="lobby__filter-label">Straights</span>
          <div className="lobby__filter-btns">
            <button className={`lobby__filter-btn${straights === null ? " lobby__filter-btn--active" : ""}`} onClick={() => setStraights(null)}>All</button>
            <button className={`lobby__filter-btn${straights === true ? " lobby__filter-btn--active" : ""}`} onClick={() => setStraights(true)}>Allowed</button>
            <button className={`lobby__filter-btn${straights === false ? " lobby__filter-btn--active" : ""}`} onClick={() => setStraights(false)}>No straights</button>
          </div>
        </div>

        <div className="lobby__filter-group">
          <span className="lobby__filter-label">Sort</span>
          <select className="lobby__sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="elo_desc">Elo: High to Low</option>
            <option value="elo_asc">Elo: Low to High</option>
          </select>
        </div>
      </div>

      {isLoading && <p className="lobby__status">Loading games...</p>}
      {error && <p className="lobby__error">{error}</p>}
      {!isLoading && !error && displayed.length === 0 && (
        <p className="lobby__status">No open games match your filters.</p>
      )}

      <h2>Open Games</h2>

      <ul className="lobby__grid">
        {displayed.map((match) => {
          const p1 = match.players?.[0]?.userId;
          const isOwn = userId && (p1?._id || p1) === userId;
          return (
            <li key={match._id}>
              <Link
                to={user ? `/game/${match._id}` : "/login"}
                className={`lobby__card lobby__card--${match.status} card stack-s`}
                onClick={() => {
                  if (user && !isOwn) {
                    joinMatch(match._id).catch(() => {});
                  }
                }}
              >
                <div className="lobby__card-player">
                  <Avatar imageUrl={p1?.profileImageUrl} username={p1?.username} size={40} />
                  <div>
                    <h3>{p1?.username || "Unknown"}</h3>
                    <p className="lobby__card-elo">Elo {p1?.eloRating?.[`tc${match.category?.timeControl || 10}`] || "?"}</p>
                  </div>
                </div>
                <p className="lobby__card-variant">
                  Best of {match.category?.rounds}, {match.category?.timeControl}s, {match.category?.straightsAllowed ? "Straights" : "No Straights"}, {match.category?.buyIn || 1}pt buy-in
                </p>
                <p className="lobby__card-variant">{match.players?.length || 1}/{match.maxPlayers || 2} players</p>
                <p className="lobby__card-waiting">{isOwn ? "Your game - waiting for players" : "Click to join"}</p>
              </Link>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <div className="lobby__load-more">
          <button className="btn btn--secondary" onClick={loadMore} disabled={isLoadingMore}>
            {isLoadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
