import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getMatch } from '../../api/matches'
import { getComments, postComment } from '../../api/comments'
import { useAuth } from '../../context/AuthContext'
import { useAppearance } from '../../context/AppearanceContext'
import Avatar from '../../components/Avatar/Avatar'

function GamePage() {
  const { id } = useParams()
  const { isLoggedIn } = useAuth()
  const { boardColor } = useAppearance()

  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [commentError, setCommentError] = useState('')

  useEffect(() => {
    async function fetchMatch() {
      try {
        const response = await getMatch(id)
        setMatch(response.data)
      } catch (err) {
        setError('Could not load this game.')
      } finally {
        setLoading(false)
      }
    }

    fetchMatch()

    const interval = setInterval(fetchMatch, 15000)

    return () => clearInterval(interval)
  }, [id])

  useEffect(() => {
    async function fetchComments() {
      try {
        const response = await getComments('Match', id)
        setComments(response.data)
      } catch (err) {
      }
    }

    fetchComments()
  }, [id])

  async function handleCommentSubmit(e) {
    e.preventDefault()
    if (!commentText.trim()) return
    setCommentError('')

    try {
      await postComment(commentText, 'Match', id)
      setCommentText('')
      const response = await getComments('Match', id)
      setComments(response.data)
    } catch (err) {
      setCommentError('Could not post comment.')
    }
  }

  if (loading) return <p className="game__status">Loading game...</p>
  if (error) return <p className="game__error">{error}</p>
  if (!match) return null

  const isWaiting = match.status === 'waiting'

  return (
    <div className="game">

      <div className="game__layout">

          <div className="game__board">

          {isWaiting && (
            <div className="game__waiting">
              <p>Waiting for another player to join...</p>
              <small>This page refreshes every 15 seconds</small>
            </div>
          )}

          <div className="game__players">
            <div className="game__player">
              <Avatar imageUrl={match.player1?.profileImageUrl} size={56} />
              <span className="game__player-name">
                {match.player1 ? match.player1.username : 'Unknown'}
              </span>
              <span className="game__player-elo">
                Elo: {match.player1 ? match.player1.eloRating : '—'}
              </span>
            </div>
            <span className="game__vs">vs</span>
            <div className="game__player">
              <Avatar imageUrl={match.player2?.profileImageUrl} size={56} />
              <span className="game__player-name">
                {match.player2 ? match.player2.username : 'Waiting...'}
              </span>
              <span className="game__player-elo">
                {match.player2 ? `Elo: ${match.player2.eloRating}` : ''}
              </span>
            </div>
          </div>

          <div className="game__dice-area" style={{ backgroundColor: boardColor }}>
            <p>Board</p>
          </div>

        </div>

        <aside className="game__sidebar">
          <h2 className="game__sidebar-title">Comments</h2>

          <div className="game__comments">
            {comments.length === 0 && (
              <p className="game__no-comments">No comments yet.</p>
            )}
            {comments.map((comment) => (
              <div key={comment._id} className="game__comment">
                <span className="game__comment-author">
                  {comment.authorId?.username || 'Unknown'}
                </span>
                <span className="game__comment-date">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
                <p className="game__comment-text">{comment.text}</p>
              </div>
            ))}
          </div>

          {isLoggedIn ? (
            <form className="game__comment-form" onSubmit={handleCommentSubmit}>
              <textarea
                className="game__comment-input"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Leave a comment..."
                rows={3}
              />
              {commentError && <p className="game__error">{commentError}</p>}
              <button type="submit" className="game__comment-submit">
                Post Comment
              </button>
            </form>
          ) : (
            <p className="game__no-comments">Log in to leave a comment.</p>
          )}

        </aside>

      </div>

    </div>
  )
}

export default GamePage
