import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTournaments } from "../../services/tournaments-service.js";

const LIMIT = 9;

export default function TournamentList() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date");

  // Only send search to API when empty or at least 3 characters, backend rejects shorter strings
  let effectiveSearch = "";
  if (search.length === 0 || search.length >= 3) {
    effectiveSearch = search;
  }

  // Active section: upcoming + in-progress
  const [active, setActive] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [activeUpcomingTotal, setActiveUpcomingTotal] = useState(0);
  const [activeInProgressTotal, setActiveInProgressTotal] = useState(0);
  const [activeIsLoading, setActiveIsLoading] = useState(true);
  const [activeIsLoadingMore, setActiveIsLoadingMore] = useState(false);
  const [activeError, setActiveError] = useState(null);

  // Past section: completed + cancelled
  const [past, setPast] = useState([]);
  const [pastPage, setPastPage] = useState(1);
  const [pastCompletedTotal, setPastCompletedTotal] = useState(0);
  const [pastCancelledTotal, setPastCancelledTotal] = useState(0);
  const [pastIsLoading, setPastIsLoading] = useState(true);
  const [pastIsLoadingMore, setPastIsLoadingMore] = useState(false);
  const [pastError, setPastError] = useState(null);

  // Fetch page 1 of both sections whenever effective search or sort changes
  useEffect(() => {
    let stale = false;
    setActiveIsLoading(true);
    setPastIsLoading(true);
    setActiveError(null);
    setPastError(null);

    Promise.all([
      getTournaments({ page: 1, limit: LIMIT, search: effectiveSearch, status: "upcoming", sort }),
      getTournaments({ page: 1, limit: LIMIT, search: effectiveSearch, status: "in-progress", sort }),
    ])
      .then(([upcomingData, inProgressData]) => {
        if (!stale) {
          setActive([...(upcomingData.results || []), ...(inProgressData.results || [])]);
          setActiveUpcomingTotal(upcomingData.total || 0);
          setActiveInProgressTotal(inProgressData.total || 0);
          setActivePage(1);
        }
      })
      .catch((err) => { if (!stale) setActiveError(err.message); })
      .finally(() => { if (!stale) setActiveIsLoading(false); });

    Promise.all([
      getTournaments({ page: 1, limit: LIMIT, search: effectiveSearch, status: "completed", sort }),
      getTournaments({ page: 1, limit: LIMIT, search: effectiveSearch, status: "cancelled", sort }),
    ])
      .then(([completedData, cancelledData]) => {
        if (!stale) {
          setPast([...(completedData.results || []), ...(cancelledData.results || [])]);
          setPastCompletedTotal(completedData.total || 0);
          setPastCancelledTotal(cancelledData.total || 0);
          setPastPage(1);
        }
      })
      .catch((err) => { if (!stale) setPastError(err.message); })
      .finally(() => { if (!stale) setPastIsLoading(false); });

    return () => { stale = true; };
  }, [effectiveSearch, sort]);

  // Load next page for both active statuses and append results
  function loadMoreActive() {
    const nextPage = activePage + 1;
    setActiveIsLoadingMore(true);
    Promise.all([
      getTournaments({ page: nextPage, limit: LIMIT, search: effectiveSearch, status: "upcoming", sort }),
      getTournaments({ page: nextPage, limit: LIMIT, search: effectiveSearch, status: "in-progress", sort }),
    ])
      .then(([upcomingData, inProgressData]) => {
        setActive((prev) => {
          return [...prev, ...(upcomingData.results || []), ...(inProgressData.results || [])];
        });
        setActivePage(nextPage);
      })
      .catch((err) => setActiveError(err.message))
      .finally(() => setActiveIsLoadingMore(false));
  }

  // Load next page for both past statuses and append results
  function loadMorePast() {
    const nextPage = pastPage + 1;
    setPastIsLoadingMore(true);
    Promise.all([
      getTournaments({ page: nextPage, limit: LIMIT, search: effectiveSearch, status: "completed", sort }),
      getTournaments({ page: nextPage, limit: LIMIT, search: effectiveSearch, status: "cancelled", sort }),
    ])
      .then(([completedData, cancelledData]) => {
        setPast((prev) => {
          return [...prev, ...(completedData.results || []), ...(cancelledData.results || [])];
        });
        setPastPage(nextPage);
      })
      .catch((err) => setPastError(err.message))
      .finally(() => setPastIsLoadingMore(false));
  }

  function handleSearch(e) {
    setSearch(e.target.value);
  }

  function handleSort(e) {
    setSort(e.target.value);
  }

  const activeTotal = activeUpcomingTotal + activeInProgressTotal;
  const pastTotal = pastCompletedTotal + pastCancelledTotal;

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

      <section className="tournaments__section">
        <h2 className="tournaments__section-heading">Active Tournaments</h2>
        {activeError && <p className="tournaments__error">{activeError}</p>}
        {activeIsLoading && <p className="tournaments__status">Loading...</p>}
        {!activeIsLoading && !activeError && active.length === 0 && (
          <p className="tournaments__status">No active tournaments.</p>
        )}
        <div className="tournaments__grid">
          {active.map((t) => { return <TournamentCard key={t._id} tournament={t} />; })}
        </div>
        {active.length < activeTotal && (
          <div className="tournaments__load-more">
            <button
              className="tournaments__load-more-btn"
              onClick={loadMoreActive}
              disabled={activeIsLoadingMore}
            >
              {activeIsLoadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </section>

      <section className="tournaments__section">
        <h2 className="tournaments__section-heading">Past Tournaments</h2>
        {pastError && <p className="tournaments__error">{pastError}</p>}
        {pastIsLoading && <p className="tournaments__status">Loading...</p>}
        {!pastIsLoading && !pastError && past.length === 0 && (
          <p className="tournaments__status">No past tournaments.</p>
        )}
        <div className="tournaments__grid">
          {past.map((t) => { return <TournamentCard key={t._id} tournament={t} />; })}
        </div>
        {past.length < pastTotal && (
          <div className="tournaments__load-more">
            <button
              className="tournaments__load-more-btn"
              onClick={loadMorePast}
              disabled={pastIsLoadingMore}
            >
              {pastIsLoadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}


function TournamentCard({ tournament: t }) {
  return (
    <Link
      to={`/tournament/${t._id}`}
      className={`tournaments__card tournaments__card--${t.status}`}
    >
      <span className={`tournaments__card-status tournaments__card-status--${t.status}`}>
        {t.status.replace("-", " ")}
      </span>
      <h2 className="tournaments__card-title">{t.title}</h2>
      {t.createdBy?.username && (
        <p className="tournaments__card-author">by {t.createdBy.username}</p>
      )}
      <p className="tournaments__card-date">
        {new Date(t.startDate).toLocaleDateString(undefined, {
          year: "numeric", month: "short", day: "numeric",
        })}
      </p>
      {t.category && (
        <p className="tournaments__card-variant">
          Best of {t.category.rounds}, {t.category.timeControl}s{t.category.straightsAllowed ? ", Straights" : ", No Straights"}, {t.category.buyIn || 1}pt buy-in
        </p>
      )}
      {t.numberOfRounds && (
        <p className="tournaments__card-variant">{t.numberOfRounds} tournament rounds</p>
      )}
      <p className="tournaments__card-players">
        {t.participants?.length || 0} players signed up
      </p>
      {t.trophy?.title && (
        <div className="tournaments__card-trophy">
          {t.trophy.imageUrl && (
            <img
              src={t.trophy.imageUrl}
              alt={t.trophy.title}
              className="tournaments__card-trophy-img"
            />
          )}
          <span className="tournaments__card-trophy-title">{t.trophy.title}</span>
        </div>
      )}
    </Link>
  );
}
