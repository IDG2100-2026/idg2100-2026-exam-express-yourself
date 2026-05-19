import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMatches, joinMatch } from '../../api/matches'
import { getUser } from '../../api/users'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/Avatar/Avatar'

function LobbyPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { isLoggedIn, userId } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchMatches() {
      try {
        const [matchesRes, userRes] = await Promise.all([
          getMatches('waiting'),
          isLoggedIn ? getUser(userId) : Promise.resolve(null)
        ])

        const all = matchesRes.data.results
        const myElo = userRes?.data?.eloRating || null

        const visible = all.filter((match) => {
          if (match.player1?._id === userId || match.player1 === userId) return false

          if (!isLoggedIn && match.allowAnonymous === false) return false

          if (isLoggedIn && myElo && match.player1?.eloRating) {
            const diff = Math.abs(match.player1.eloRating - myElo)
            if (diff > 200) return false
          }

          return true
        })

        setMatches(visible)
      } catch (err) {
        setError('Could not load games. Is the backend running?')
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [isLoggedIn, userId])

  async function handleJoin(match) {
    try {
      await joinMatch(match._id)
    } catch (err) {
    }
    navigate(`/game/${match._id}`)
  }

  return (
    <div className="lobby">
      <div className="lobby__header">
        <h1 className="lobby__title">Game Lobby</h1>
        <Link to="/create-game" className="lobby__create">+ New Game</Link>
      </div>

      {loading && <p className="lobby__status">Loading games...</p>}
      {error && <p className="lobby__error">{error}</p>}

      {!loading && !error && matches.length === 0 && (
        <p className="lobby__status">No open games right now. Be the first!</p>
      )}

      <div className="lobby__grid">
        {matches.map((match) => (
          <button
            key={match._id}
            className="lobby__card"
            onClick={() => handleJoin(match)}
          >
            <div className="lobby__card-player">
              <Avatar imageUrl={match.player1?.profileImageUrl} size={40} />
              <div>
                <div>{match.player1?.username || 'Unknown'}</div>
                <div className="lobby__card-elo">Elo {match.player1?.eloRating || '?'}</div>
              </div>
            </div>
            <div className="lobby__card-variant">
              <span>Best of {match.category.rounds}</span>
              <span>{match.category.rules}</span>
              <span>{match.category.timeControl}s / round</span>
            </div>
            <div className="lobby__card-waiting">Join game →</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default LobbyPage
