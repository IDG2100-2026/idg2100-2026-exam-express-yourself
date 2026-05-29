import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMatches, joinMatch } from "../../services/matches-service.js";
import { getTournaments } from "../../services/tournaments-service.js";
import { getPlatformActivity } from "../../services/platform-activity-service.js";
import { useAppearance } from "../../hooks/useAppearance.js";
import { useAuth } from "../../hooks/useAuth.js";

function getPlayer(match, index) {
  return match.players?.[index]?.userId || null;
}

function getPlayerElo(player, tc) {
  return player?.eloRating?.[`tc${tc || 10}`] || player?.eloRating?.tc10 || 0;
}

function avgElo(match) {
  const tc = match.category?.timeControl;
  const p1 = getPlayerElo(getPlayer(match, 0), tc);
  const p2 = getPlayerElo(getPlayer(match, 1), tc);
  return p2 ? Math.round((p1 + p2) / 2) : p1;
}

export default function Home() {
  const [data, setData] = useState({ waiting: [], top: [], tournaments: [], activity: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { appearance } = useAppearance();
  const { user } = useAuth();

  const userId = user?._id || user?.userId;

  useEffect(() => {
    let stale = false;
    async function fetchAll() {
      try {
        const [waitingRes, activeRes, completedRes, tournamentsRes, activityRes] = await Promise.all([
          getMatches({ status: "waiting", limit: 9 }),
          getMatches({ status: "in-progress", limit: 9 }),
          getMatches({ status: "completed", limit: 9 }),
          getTournaments({ status: "upcoming", limit: 5 }),
          getPlatformActivity(),
        ]);

        if (stale) return;

        const inProgress = (activeRes.results || []).sort((a, b) => avgElo(b) - avgElo(a));
        const top = inProgress.slice(0, 5);
        if (top.length < 5) {
          top.push(...(completedRes.results || []).slice(0, 5 - top.length));
        }

        setData({
          waiting: waitingRes.results || [],
          top,
          tournaments: (tournamentsRes.results || []).slice(0, 5),
          activity: activityRes,
        });
      } catch (err) {
        if (!stale) setError(err.message);
      } finally {
        if (!stale) setIsLoading(false);
      }
    }
    fetchAll();
    return () => { stale = true; };
  }, []);

  return (
    <div className="home stack-l">
      <section className="home__hero">
        <h1 className="home__title">Spanish Poker Dice</h1>
        <p className="home__description">
          Challenge players from around the world in the classic Spanish dice game.
          Bluff, roll, and outsmart your opponents to win tournaments and earn trophies.
        </p>
        <Link to="/create-game" className="home__cta btn btn--primary">+ Create game</Link>
      </section>

      {data.activity && (
        <section className="home__activity stack-m">
          <div className="home__section-header">
            <h2>Platform activity</h2>
          </div>
          <ul className="home__activity-list">
            <li><strong>{data.activity.availableGames}</strong> joinable games</li>
            <li><strong>{data.activity.ongoingMatches}</strong> games in progress</li>
            <li><strong>{data.activity.activePlayers}</strong> players active this week</li>
            <li><strong>{data.activity.gamesThisWeek}</strong> games played this week</li>
          </ul>
        </section>
      )}

      {isLoading && <p className="home__status">Loading...</p>}
      {error && <p className="home__error">{error}</p>}

      {!isLoading && !error && (
        <>
          <section className="home__section stack-m">
            <div className="home__section-header">
              <h2>Joinable games</h2>
              <Link to="/lobby">See all</Link>
            </div>
            {data.waiting.length === 0 ? (
              <p className="home__empty">No open games right now.</p>
            ) : (
              <ul className="home__grid">
                {data.waiting.slice(0, appearance.lobbySize).map((match) => {
                  const p1 = getPlayer(match, 0);
                  const isOwn = userId && (p1?._id || p1) === userId;
                  return (
                    <li key={match._id}>
                      <Link
                        to={user ? `/game/${match._id}` : "/login"}
                        className="home__card home__card--waiting card stack-s"
                        onClick={() => {
                          if (user && !isOwn) {
                            joinMatch(match._id).catch(() => {});
                          }
                        }}
                      >
                        <h3 className="home__card-player">{p1?.username || "Unknown"}</h3>
                        <p className="home__card-elo">Elo: {getPlayerElo(p1, match.category?.timeControl) || "?"}</p>
                        <p className="home__card-variant">Best of {match.category?.rounds}, {match.category?.timeControl}s, {match.category?.straightsAllowed ? "Straights" : "No Straights"}, {match.category?.buyIn || 1}pt buy-in</p>
                        <p className="home__card-variant">{match.players?.length || 1}/{match.maxPlayers || 2} players</p>
                        <p className="home__card-waiting">{isOwn ? "Your game - waiting for players" : "Click to join"}</p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="home__section stack-m">
            <div className="home__section-header">
              <h2>Top games in progress</h2>
            </div>
            {data.top.length === 0 ? (
              <p className="home__empty">No games yet.</p>
            ) : (
              <ul className="home__grid">
                {data.top.map((match) => (
                  <li key={match._id}>
                    <Link to={`/game/${match._id}`} className={`home__card home__card--${match.status} card stack-s`}>
                      <h3 className="home__card-player">{getPlayer(match, 0)?.username || "?"} vs {getPlayer(match, 1)?.username || "waiting"}</h3>
                      <p className="home__card-elo">Avg Elo: {avgElo(match)}</p>
                      <p className="home__card-variant">Best of {match.category?.rounds}, {match.category?.timeControl}s, {match.category?.straightsAllowed ? "Straights" : "No Straights"}, {match.category?.buyIn || 1}pt buy-in</p>
                      <p className={`home__card-status home__card-status--${match.status}`}>{match.status}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="home__section stack-m">
            <div className="home__section-header">
              <h2>Upcoming tournaments</h2>
              <Link to="/tournaments">See all</Link>
            </div>
            {data.tournaments.length === 0 ? (
              <p className="home__empty">No upcoming tournaments.</p>
            ) : (
              <ul className="home__grid">
                {data.tournaments.map((tournament) => (
                  <li key={tournament._id}>
                    <Link to={`/tournament/${tournament._id}`} className={`home__card home__card--${tournament.status} card stack-s`}>
                      <h3 className="home__card-player">{tournament.title}</h3>
                      <p className="home__card-variant">
                        {new Date(tournament.startDate).toLocaleDateString(undefined, {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </p>
                      {tournament.category && (
                        <p className="home__card-variant">
                          Best of {tournament.category.rounds}, {tournament.category.timeControl}s{tournament.category.straightsAllowed ? ", Straights" : ", No Straights"}, {tournament.category.buyIn || 1}pt buy-in
                        </p>
                      )}
                      {tournament.numberOfRounds && (
                        <p className="home__card-variant">{tournament.numberOfRounds} tournament rounds</p>
                      )}
                      <p className="home__card-waiting">{tournament.participants?.length || 0} players signed up</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
