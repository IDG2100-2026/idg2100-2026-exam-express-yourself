import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  useEffect(() => {
    let stale = false;
    async function fetchAll() {
      try {
        const [waitingRes, activeRes, completedRes, tournamentsRes, activityRes] = await Promise.all([
          getMatches("waiting"),
          getMatches("in-progress"),
          getMatches("completed"),
          getTournaments(),
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

  async function handleJoinGame(match) {
    if (!user) { navigate("/login"); return; }
    const p1Id = getPlayer(match, 0)?._id;
    const userId = user?._id || user?.userId;
    if (p1Id === userId) {
      navigate(`/game/${match._id}`);
      return;
    }
    try { await joinMatch(match._id); } catch (err) { /* proceed anyway */ }
    navigate(`/game/${match._id}`);
  }

  return (
    <div className="home">
      <section className="home__hero">
        <h1 className="home__title">Spanish Poker Dice</h1>
        <p className="home__description">
          Challenge players from around the world in the classic Spanish dice game.
          Bluff, roll, and outsmart your opponents to climb the leaderboard.
        </p>
        <Link to="/create-game" className="home__cta">Create a Game</Link>
      </section>

      {data.activity && (
        <section className="home__activity">
          <div className="home__activity-item"><strong>{data.activity.ongoingMatches}</strong> games in progress</div>
          <div className="home__activity-item"><strong>{data.activity.availableGames}</strong> open games</div>
          <div className="home__activity-item"><strong>{data.activity.activePlayers}</strong> active this week</div>
          <div className="home__activity-item"><strong>{data.activity.gamesThisWeek}</strong> games this week</div>
        </section>
      )}

      {isLoading && <p className="home__status">Loading...</p>}
      {error && <p className="home__error">{error}</p>}

      {!isLoading && !error && (
        <>
          <section className="home__section">
            <div className="home__section-header">
              <h2>Open Games</h2>
              <Link to="/lobby">See all</Link>
            </div>
            {data.waiting.length === 0 ? (
              <p className="home__empty">No open games right now.</p>
            ) : (
              <div className="home__grid">
                {data.waiting.slice(0, appearance.lobbySize).map((match) => {
                  const p1 = getPlayer(match, 0);
                  return (
                    <button key={match._id} className="home__card home__card--btn" onClick={() => handleJoinGame(match)}>
                      <div className="home__card-player">{p1?.username || "Unknown"}</div>
                      <div className="home__card-variant">Best of {match.category?.rounds} — {match.category?.timeControl}s</div>
                      <div className="home__card-elo">Elo: {getPlayerElo(p1, match.category?.timeControl) || "—"}</div>
                      <div className="home__card-waiting">Click to join</div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="home__section">
            <div className="home__section-header"><h2>Top Games</h2></div>
            {data.top.length === 0 ? (
              <p className="home__empty">No games yet.</p>
            ) : (
              <div className="home__grid">
                {data.top.map((match) => (
                  <Link to={`/game/${match._id}`} key={match._id} className="home__card">
                    <div className="home__card-player">{getPlayer(match, 0)?.username || "?"} vs {getPlayer(match, 1)?.username || "waiting"}</div>
                    <div className="home__card-variant">Best of {match.category?.rounds} — {match.category?.timeControl}s</div>
                    <div className="home__card-elo">Avg Elo: {avgElo(match)}</div>
                    <div className={`home__card-status home__card-status--${match.status}`}>{match.status}</div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="home__section">
            <div className="home__section-header">
              <h2>Upcoming Tournaments</h2>
              <Link to="/tournaments">See all</Link>
            </div>
            {data.tournaments.length === 0 ? (
              <p className="home__empty">No upcoming tournaments.</p>
            ) : (
              <div className="home__grid">
                {data.tournaments.map((t) => (
                  <Link to={`/tournament/${t._id}`} key={t._id} className="home__card">
                    <div className="home__card-player">{t.title}</div>
                    <div className="home__card-variant">{new Date(t.startDate).toLocaleDateString()}</div>
                    <div className="home__card-waiting">{t.participants?.length || 0} players signed up</div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
