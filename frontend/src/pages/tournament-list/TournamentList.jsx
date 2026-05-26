import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTournaments } from "../../services/tournaments-service.js";
import "./tournament-list.scss";

const STATUS_TABS = ["all", "upcoming", "in-progress", "completed", "cancelled"];
const LIMIT = 9;

export default function TournamentList() {
  const [tournaments, setTournaments] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("date");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Reset and fetch from page 1 whenever filters change
  useEffect(() => {
    let stale = false;
    setIsLoading(true);
    setPage(1);
    getTournaments({ page: 1, limit: LIMIT, search, status, sort })
      .then((data) => {
        if (!stale) {
          setTournaments(data.results || []);
          setHasMore((data.results?.length || 0) < (data.total || 0));
        }
      })
      .catch((err) => { if (!stale) setError(err.message); })
      .finally(() => { if (!stale) setIsLoading(false); });
    return () => { stale = true; };
  }, [search, status, sort]);

  function loadMore() {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    getTournaments({ page: nextPage, limit: LIMIT, search, status, sort })
      .then((data) => {
        setTournaments((prev) => [...prev, ...(data.results || [])]);
        setHasMore(
          tournaments.length + (data.results?.length || 0) < (data.total || 0)
        );
        setPage(nextPage);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoadingMore(false));
  }

  function handleSearch(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  function handleStatus(s) {
    setStatus(s);
    setPage(1);
  }

  function handleSort(e) {
    setSort(e.target.value);
    setPage(1);
  }

  return (
    <div className="tournaments">
      <h1 className="tournaments__title">Tournaments</h1>

      <div className="tournaments__controls">
        <input
          className="tournaments__search"
          type="text"
          placeholder="Search tournaments..."
          value={search}
          onChange={handleSearch}
        />
        <select className="tournaments__sort" value={sort} onChange={handleSort}>
          <option value="date">Sort: Date</option>
          <option value="title">Sort: Title</option>
          <option value="players">Sort: Players</option>
        </select>
      </div>

      <div className="tournaments__tabs">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            className={`tournaments__tab${status === s ? " tournaments__tab--active" : ""}`}
            onClick={() => handleStatus(s)}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")}
          </button>
        ))}
      </div>

      {error && <p className="tournaments__error">{error}</p>}
      {isLoading && <p className="tournaments__status">Loading...</p>}
      {!isLoading && !error && tournaments.length === 0 && (
        <p className="tournaments__status">No tournaments found.</p>
      )}

      <div className="tournaments__grid">
        {tournaments.map((t) => (
          <Link
            to={`/tournament/${t._id}`}
            key={t._id}
            className={`tournaments__card tournaments__card--${t.status}`}
          >
            <span className={`tournaments__card-status tournaments__card-status--${t.status}`}>
              {t.status.replace("-", " ")}
            </span>
            <h2 className="tournaments__card-title">{t.title}</h2>
            <p className="tournaments__card-date">
              {new Date(t.startDate).toLocaleDateString(undefined, {
                year: "numeric", month: "short", day: "numeric",
              })}
            </p>
            <p className="tournaments__card-players">
              {t.participants?.length || 0} players signed up
            </p>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="tournaments__load-more">
          <button
            className="tournaments__load-more-btn"
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
