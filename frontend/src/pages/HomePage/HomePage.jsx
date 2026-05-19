import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMatches, joinMatch } from '../../api/matches'
import { getTournaments } from '../../api/tournaments'
import { useAppearance } from '../../context/AppearanceContext'
import { useAuth } from '../../context/AuthContext'

function HomePage() {
  const [waitingGames, setWaitingGames] = useState([])
  const [topGames, setTopGames] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { lobbySize } = useAppearance()
  const { userId } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchData() {
      try {
        const [waitingRes, activeRes, completedRes, tournamentsRes] = await Promise.all([
          getMatches('waiting'),
          getMatches('in-progress'),
          getMatches('completed'),
          getTournaments()
        ])

        setWaitingGames(waitingRes.data.results)

        const inProgress = activeRes.data.results.sort((a, b) => avgElo(b) - avgElo(a))
        const top = inProgress.slice(0, 5)
        if (top.length < 5) {
          const needed = 5 - top.length
          top.push(...completedRes.data.results.slice(0, needed))
        }
        setTopGames(top)

        setTournaments(tournamentsRes.data.results.slice(0, 5))
      } catch (err) {
        setError('Could not load platform data.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  function avgElo(match) {
    const p1 = match.player1?.eloRating || 0
    const p2 = match.player2?.eloRating || 0
    return p2 ? Math.round((p1 + p2) / 2) : p1
  }

  async function handleJoinGame(match) {
    if (match.player1?._id === userId || match.player1 === userId) {
      navigate(`/game/${match._id}`)
      return
    }
    try {
      await joinMatch(match._id)
    } catch (err) {
    }
    navigate(`/game/${match._id}`)
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

      {loading && <p className="home__status">Loading...</p>}
      {error && <p className="home__error">{error}</p>}

      {!loading && !error && (
        <>
          <section className="home__section">
            <div className="home__section-header">
              <h2>Open Games</h2>
              <Link to="/lobby">See all</Link>
            </div>

            {waitingGames.length === 0 ? (
              <p className="home__empty">No open games right now.</p>
            ) : (
              <div className="home__grid">
                {waitingGames.slice(0, lobbySize).map((match) => (
                  <button
                    key={match._id}
                    className="home__card home__card--btn"
                    onClick={() => handleJoinGame(match)}
                  >
                    <div className="home__card-player">
                      {match.player1?.username || 'Unknown'}
                    </div>
                    <div className="home__card-variant">
                      Best of {match.category?.rounds} — {match.category?.timeControl}s
                    </div>
                    <div className="home__card-elo">Elo: {match.player1?.eloRating || '—'}</div>
                    <div className="home__card-waiting">Click to join</div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="home__section">
            <div className="home__section-header">
              <h2>Top Games</h2>
            </div>

            {topGames.length === 0 ? (
              <p className="home__empty">No games yet.</p>
            ) : (
              <div className="home__grid">
                {topGames.map((match) => (
                  <Link to={`/game/${match._id}`} key={match._id} className="home__card">
                    <div className="home__card-player">
                      {match.player1?.username || '?'} vs {match.player2?.username || 'waiting'}
                    </div>
                    <div className="home__card-variant">
                      Best of {match.category?.rounds} — {match.category?.timeControl}s
                    </div>
                    <div className="home__card-elo">Avg Elo: {avgElo(match)}</div>
                    <div className={`home__card-status home__card-status--${match.status}`}>
                      {match.status}
                    </div>
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

            {tournaments.length === 0 ? (
              <p className="home__empty">No upcoming tournaments.</p>
            ) : (
              <div className="home__grid">
                {tournaments.map((tournament) => (
                  <Link to={`/tournament/${tournament._id}`} key={tournament._id} className="home__card">
                    <div className="home__card-player">{tournament.title}</div>
                    <div className="home__card-variant">
                      {new Date(tournament.startDate).toLocaleDateString()}
                    </div>
                    <div className="home__card-variant">
                      Best of {tournament.category?.rounds} — {tournament.category?.timeControl}s
                    </div>
                    <div className="home__card-waiting">
                      {tournament.participants.length} players signed up
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}

    </div>
  )
}

export default HomePage
