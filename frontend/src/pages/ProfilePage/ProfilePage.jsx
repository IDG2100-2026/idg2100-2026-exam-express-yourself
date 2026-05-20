import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getUser, updateUser } from '../../api/users'
import { useAuth } from '../../context/AuthContext'

function ProfilePage() {
  const { id } = useParams()
  const { userId, updateProfileImage } = useAuth()
  const isOwnProfile = userId === id

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editing, setEditing] = useState(false)
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [password, setPassword] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await getUser(id)
        setUser(data)
        setEmail(data.email || '')
        setBio(data.bio || '')
        setProfileImageUrl(data.profileImageUrl || '')
      } catch (err) {
        setError('Could not load this profile.')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [id])

  async function handleSave(e) {
    e.preventDefault()
    setSaveError('')
    setSaveSuccess('')

    try {
      const updates = { email, bio, profileImageUrl }
      if (password) updates.password = password

      await updateUser(id, updates)

      setSaveSuccess('Profile updated!')
      setPassword('')
      setEditing(false)
      if (isOwnProfile) updateProfileImage(profileImageUrl)
      const refreshed = await getUser(id)
      setUser(refreshed)
    } catch (err) {
      setSaveError('Could not reach the server.')
    }
  }

  function calcStats(matches) {
    if (!matches || matches.length === 0) return { wins: 0, losses: 0, monthWins: 0, monthLosses: 0 }

    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    let wins = 0, losses = 0, monthWins = 0, monthLosses = 0

    matches.forEach((match) => {
      const won = match.winnerId?._id === id || match.winnerId === id
      if (won) wins++; else losses++

      const playedAt = new Date(match.updatedAt)
      if (playedAt >= oneMonthAgo) {
        if (won) monthWins++; else monthLosses++
      }
    })

    return { wins, losses, monthWins, monthLosses }
  }

  function eloByTimeControl(matches) {
    const groups = { 5: [], 10: [], 15: [] }
    if (!matches) return groups
    matches.forEach((match) => {
      const tc = match.category?.timeControl
      if (groups[tc]) groups[tc].push(match)
    })
    return groups
  }

  if (loading) return <p className="profile__status">Loading profile...</p>
  if (error) return <p className="profile__error">{error}</p>
  if (!user) return null

  const stats = calcStats(user.recentMatches)
  const byTc = eloByTimeControl(user.recentMatches)

  return (
    <div className="profile">

      {/* Profile header */}
      <div className="profile__header">
        <div className="profile__avatar">
          {user.profileImageUrl
            ? <img src={user.profileImageUrl} alt={user.username} className="profile__avatar-img" />
            : <span>{user.username.charAt(0).toUpperCase()}</span>
          }
        </div>
        <div className="profile__info">
          <h1 className="profile__username">{user.username}</h1>
          {isOwnProfile && <p className="profile__email">{user.email}</p>}
          <p className="profile__bio">{user.bio || 'No bio yet.'}</p>
          {isOwnProfile && (
            <button className="profile__edit-btn" onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          )}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <form className="profile__form" onSubmit={handleSave}>
          <h2 className="profile__form-title">Edit Profile</h2>

          <div className="profile__field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="profile__field">
            <label>Profile image URL</label>
            <input
              type="url"
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div className="profile__field">
            <label>About Me</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell us about yourself..."
              maxLength={300}
            />
          </div>

          <div className="profile__field">
            <label>New Password <span>(leave blank to keep current)</span></label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {saveError && <p className="profile__error">{saveError}</p>}
          {saveSuccess && <p className="profile__success">{saveSuccess}</p>}

          <button type="submit" className="profile__save-btn">Save Changes</button>
        </form>
      )}

      {/* Elo stats */}
      <div className="profile__stats">
        <div className="profile__stat">
          <span className="profile__stat-value">{user.eloRating}</span>
          <span className="profile__stat-label">Overall Elo</span>
        </div>
        <div className="profile__stat">
          <span className="profile__stat-value">{user.recentMatches?.length || 0}</span>
          <span className="profile__stat-label">Games Played</span>
        </div>
        <div className="profile__stat">
          <span className="profile__stat-value">{byTc[5].length > 0 ? user.eloRating : '—'}</span>
          <span className="profile__stat-label">Elo (5s)</span>
        </div>
        <div className="profile__stat">
          <span className="profile__stat-value">{byTc[10].length > 0 ? user.eloRating : '—'}</span>
          <span className="profile__stat-label">Elo (10s)</span>
        </div>
        <div className="profile__stat">
          <span className="profile__stat-value">{byTc[15].length > 0 ? user.eloRating : '—'}</span>
          <span className="profile__stat-label">Elo (15s)</span>
        </div>
        <div className="profile__stat">
          <span className="profile__stat-value">{stats.wins}</span>
          <span className="profile__stat-label">Total Wins</span>
        </div>
        <div className="profile__stat">
          <span className="profile__stat-value">{stats.losses}</span>
          <span className="profile__stat-label">Total Losses</span>
        </div>
        <div className="profile__stat">
          <span className="profile__stat-value">{stats.monthWins}</span>
          <span className="profile__stat-label">Wins (month)</span>
        </div>
        <div className="profile__stat">
          <span className="profile__stat-value">{stats.monthLosses}</span>
          <span className="profile__stat-label">Losses (month)</span>
        </div>
      </div>

      {/* Trophies */}
      {user.trophies?.length > 0 && (
        <div className="profile__trophies">
          <h2 className="profile__section-title">Trophies</h2>
          <div className="profile__trophy-list">
            {user.trophies.map((trophy, i) => (
              <div key={i} className="profile__trophy">
                {trophy.imageUrl && <img src={trophy.imageUrl} alt={trophy.title} />}
                <span>{trophy.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last 10 games */}
      <div className="profile__games">
        <div className="profile__games-header">
          <h2 className="profile__section-title">Last 10 Games</h2>
          <Link to={`/profile/${id}/games`} className="profile__all-games">View all games →</Link>
        </div>

        {!user.recentMatches || user.recentMatches.length === 0 ? (
          <p className="profile__status">No games played yet.</p>
        ) : (
          <div className="profile__game-list">
            {user.recentMatches.map((match) => {
              const won = match.winnerId?._id === id || match.winnerId === id
              const opponent = match.player1?._id === id || match.player1 === id
                ? match.player2
                : match.player1

              return (
                <Link to={`/game/${match._id}`} key={match._id} className="profile__game">
                  <span className={`profile__result profile__result--${won ? 'win' : 'loss'}`}>
                    {won ? 'Win' : 'Loss'}
                  </span>
                  <span className="profile__opponent">vs {opponent?.username || 'Unknown'}</span>
                  <span className="profile__game-variant">
                    {match.category?.timeControl}s / round
                  </span>
                  <span className="profile__game-date">
                    {new Date(match.updatedAt).toLocaleDateString()}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

export default ProfilePage
