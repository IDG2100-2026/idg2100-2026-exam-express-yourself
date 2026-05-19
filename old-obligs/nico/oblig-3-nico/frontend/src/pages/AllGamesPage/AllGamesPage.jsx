import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPlayerMatches } from '../../api/matches'

function AllGamesPage() {
  const { id } = useParams()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchMatches() {
      try {
        const response = await getPlayerMatches(id)
        setMatches(response.data.results)
      } catch (err) {
        setError('Could not load games.')
      } finally {
        setLoading(false)
      }
    }
    fetchMatches()
  }, [id])

  return (
    <div className="allgames">
      <div className="allgames__header">
        <h1 className="allgames__title">All Games</h1>
        <Link to={`/profile/${id}`} className="allgames__back">← Back to profile</Link>
      </div>

      {loading && <p className="allgames__status">Loading...</p>}
      {error && <p className="allgames__error">{error}</p>}

      {!loading && !error && matches.length === 0 && (
        <p className="allgames__status">No games found.</p>
      )}

      <div className="allgames__list">
        {matches.map((match) => {
          const won = match.winnerId?._id === id || match.winnerId === id
          const opponent = match.player1?._id === id || match.player1 === id
            ? match.player2
            : match.player1

          return (
            <Link to={`/game/${match._id}`} key={match._id} className="allgames__row">
              <span className={`allgames__result allgames__result--${match.status === 'completed' ? (won ? 'win' : 'loss') : match.status}`}>
                {match.status === 'completed' ? (won ? 'Win' : 'Loss') : match.status}
              </span>
              <span className="allgames__opponent">
                vs {opponent?.username || 'Unknown'}
              </span>
              <span className="allgames__variant">
                Best of {match.category?.rounds} — {match.category?.timeControl}s
              </span>
              <span className="allgames__date">
                {new Date(match.updatedAt).toLocaleDateString()}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default AllGamesPage
