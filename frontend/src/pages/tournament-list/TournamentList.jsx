import { useState, useEffect } from "react";
import { Link } from "react-router";
import { getTournaments } from "../../services/tournaments-service.js";

const LIMIT = 9;

export default function TournamentList() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date");

  let effectiveSearch = "";
  if (search.length === 0 || search.length >= 3) {
    effectiveSearch = search;
  }

  const [active, setActive] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [activeUpcomingTotal, setActiveUpcomingTotal] = useState(0);
  const [activeInProgressTotal, setActiveInProgressTotal] = useState(0);
  const [activeIsLoading, setActiveIsLoading] = useState(true);
  const [activeIsLoadingMore, setActiveIsLoadingMore] = useState(false);
  const [activeError, setActiveError] = useState(null);

  const [past, setPast] = useState([]);
  const [pastPage, setPastPage] = useState(1);
  const [pastCompletedTotal, setPastCompletedTotal] = useState(0);
  const [pastCancelledTotal, setPastCancelledTotal] = useState(0);
  const [pastIsLoading, setPastIsLoading] = useState(true);
  const [pastIsLoadingMore, setPastIsLoadingMore] = useState(false);
  const [pastError, setPastError] = useState(null);

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
      .catch((err) => { if (!stale) { setActiveError(err.message); } })
      .finally(() => { if (!stale) { setActiveIsLoading(false); } });

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
      .catch((err) => { if (!stale) { setPastError(err.message); } })
      .finally(() => { if (!stale) { setPastIsLoading(false); } });

    return () => { stale = true; };
  }, [effectiveSearch, sort]);

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
      .catch((err) => { setActiveError(err.message); })
      .finally(() => { setActiveIsLoadingMore(false); });
  }

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
      .catch((err) => { setPastError(err.message); })
      .finally(() => { setPastIsLoadingMore(false); });
  }

  const activeTotal = activeUpcomingTotal + activeInProgressTotal;
  const pastTotal = pastCompletedTotal + pastCancelledTotal;

  return (
    <div className="tournaments stack-l">
      <h1>Tournaments</h1>

      <div className="tournaments__controls">
        <input
          className="tournaments__search"
          type="text"
          placeholder="Search tournaments..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); }}
        />
        <select className="tournaments__sort" value={sort} onChange={(e) => { setSort(e.target.value); }}>
          <option value="date">Sort: date</option>
          <option value="title">Sort: title</option>
          <option value="players">Sort: players</option>
        </select>
      </div>

      <section className="tournaments__section stack-m">
        <h2>Active tournaments</h2>
        {activeError && <p className="tournaments__error">{activeError}</p>}
        {activeIsLoading && <p className="tournaments__status">Loading...</p>}
        {!activeIsLoading && !activeError && active.length === 0 && (
          <p className="tournaments__status">No active tournaments.</p>
        )}
        <ul className="tournaments__grid">
          {active.map((tournament) => (
            <TournamentCard key={tournament._id} tournament={tournament} />
          ))}
        </ul>
        {active.length < activeTotal && (
          <div className="tournaments__load-more">
            <button className="btn btn--secondary" onClick={loadMoreActive} disabled={activeIsLoadingMore}>
              {activeIsLoadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </section>

      <section className="tournaments__section stack-m">
        <h2>Past tournaments</h2>
        {pastError && <p className="tournaments__error">{pastError}</p>}
        {pastIsLoading && <p className="tournaments__status">Loading...</p>}
        {!pastIsLoading && !pastError && past.length === 0 && (
          <p className="tournaments__status">No past tournaments.</p>
        )}
        <ul className="tournaments__grid">
          {past.map((tournament) => (
            <TournamentCard key={tournament._id} tournament={tournament} />
          ))}
        </ul>
        {past.length < pastTotal && (
          <div className="tournaments__load-more">
            <button className="btn btn--secondary" onClick={loadMorePast} disabled={pastIsLoadingMore}>
              {pastIsLoadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function TournamentCard({ tournament }) {
  return (
    <li>
      <Link
        to={`/tournament/${tournament._id}`}
        className={`tournaments__card tournaments__card--${tournament.status} card`}
      >
        <span className={`tournaments__card-status tournaments__card-status--${tournament.status}`}>
          {tournament.status.replace("-", " ")}
        </span>
        <h3>{tournament.title}</h3>
        {tournament.createdBy?.username && (
          <p className="tournaments__card-author">by {tournament.createdBy.username}</p>
        )}
        <p className="tournaments__card-date">
          {new Date(tournament.startDate).toLocaleDateString("en-GB")}
        </p>
        {tournament.category && (
          <p className="tournaments__card-variant">
            Best of {tournament.category.rounds}, {tournament.category.timeControl}s{tournament.category.straightsAllowed ? ", Straights" : ", No straights"}, {tournament.category.buyIn || 1}pt buy-in
          </p>
        )}
        {tournament.numberOfRounds && (
          <p className="tournaments__card-variant">{tournament.numberOfRounds} tournament rounds</p>
        )}
        {tournament.rules && (
          <p className="tournaments__card-rules">{tournament.rules}</p>
        )}
        <p className="tournaments__card-players">{tournament.participants?.length || 0} players signed up</p>
        {tournament.trophy?.title && (
          <div className="tournaments__card-trophy">
            {tournament.trophy.imageUrl && (
              <img src={tournament.trophy.imageUrl} alt={tournament.trophy.title} className="tournaments__card-trophy-img" />
            )}
            <span className="tournaments__card-trophy-title">{tournament.trophy.title}</span>
          </div>
        )}
      </Link>
    </li>
  );
}
