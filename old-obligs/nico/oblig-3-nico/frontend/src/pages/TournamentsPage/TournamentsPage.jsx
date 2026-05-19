import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getTournaments } from '../../api/tournaments'

function TournamentsPage() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchTournaments() {
      try {
        const response = await getTournaments()
        setTournaments(response.data.results)
      } catch (err) {
        setError('Could not load tournaments.')
      } finally {
        setLoading(false)
      }
    }

    fetchTournaments()
  }, [])

  return (
    <div className="tournaments">
      <h1 className="tournaments__title">Tournaments</h1>

      {loading && <p className="tournaments__status">Loading tournaments...</p>}
      {error && <p className="tournaments__error">{error}</p>}

      {!loading && !error && tournaments.length === 0 && (
        <p className="tournaments__status">No tournaments found.</p>
      )}

      <div className="tournaments__grid">
        {tournaments.map((tournament) => (
          <Link
            to={`/tournament/${tournament._id}`}
            key={tournament._id}
            className="tournaments__card"
          >
            <span className="tournaments__card-status">{tournament.status}</span>
            <h2 className="tournaments__card-title">{tournament.title}</h2>
            <p className="tournaments__card-date">
              {new Date(tournament.startDate).toLocaleDateString()}
            </p>
            <p className="tournaments__card-players">
              {tournament.participants.length} players signed up
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default TournamentsPage
