import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useUser } from "../../hooks/useUser.js";
import { useAuth } from "../../hooks/useAuth.js";
import { updateUser } from "../../services/users-service.js";

export default function Profile() {
  const { id } = useParams();
  const { user: authUser } = useAuth();
  const { user, isLoading, error, refetch } = useUser(id);

  const userId = authUser?._id || authUser?.userId;
  const isOwnProfile = userId === id;

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ email: "", bio: "", profileImageUrl: "", password: "" });
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);

  function startEditing() {
    setFormData({
      email: user?.email || "",
      bio: user?.bio || "",
      profileImageUrl: user?.profileImageUrl || "",
      password: "",
    });
    setEditing(true);
    setSaveError(null);
    setSaveSuccess(null);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const updates = { email: formData.email, bio: formData.bio, profileImageUrl: formData.profileImageUrl };
      if (formData.password) updates.password = formData.password;

      await updateUser(id, updates);
      setSaveSuccess("Profile updated!");
      setEditing(false);
      refetch();
    } catch (err) {
      setSaveError(err.message);
    }
  }

  function calcStats(matches) {
    if (!matches || matches.length === 0) return { wins: 0, losses: 0, monthWins: 0, monthLosses: 0 };
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    let wins = 0, losses = 0, monthWins = 0, monthLosses = 0;
    matches.forEach((m) => {
      const won = m.winnerId?._id === id || m.winnerId === id;
      if (won) wins++; else losses++;
      if (new Date(m.updatedAt) >= oneMonthAgo) {
        if (won) monthWins++; else monthLosses++;
      }
    });
    return { wins, losses, monthWins, monthLosses };
  }

  if (isLoading) return <p className="profile__status">Loading profile...</p>;
  if (error) return <p className="profile__error">{error}</p>;
  if (!user) return null;

  const stats = calcStats(user.recentMatches);

  return (
    <div className="profile">
      <div className="profile__header">
        <div className="profile__avatar">
          {user.profileImageUrl ? <img src={user.profileImageUrl} alt={user.username} className="profile__avatar-img" /> : <span>{user.username.charAt(0).toUpperCase()}</span>}
        </div>
        <div className="profile__info">
          <h1 className="profile__username">{user.username}</h1>
          {isOwnProfile && <p className="profile__email">{user.email}</p>}
          <p className="profile__bio">{user.bio || "No bio yet."}</p>
          {isOwnProfile && (
            <button className="profile__edit-btn" onClick={editing ? () => setEditing(false) : startEditing}>
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          )}
        </div>
      </div>

      {editing && (
        <form className="profile__form" onSubmit={handleSave}>
          <h2 className="profile__form-title">Edit Profile</h2>
          <div className="profile__field"><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} /></div>
          <div className="profile__field"><label>Profile image URL</label><input type="url" name="profileImageUrl" value={formData.profileImageUrl} onChange={handleChange} placeholder="https://example.com/photo.jpg" /></div>
          <div className="profile__field"><label>About Me</label><textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} maxLength={300} /></div>
          <div className="profile__field"><label>New Password <span>(leave blank to keep current)</span></label><input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" /></div>
          {saveError && <p className="profile__error">{saveError}</p>}
          {saveSuccess && <p className="profile__success">{saveSuccess}</p>}
          <button type="submit" className="profile__save-btn">Save Changes</button>
        </form>
      )}

      <div className="profile__stats">
        <div className="profile__stat"><span className="profile__stat-value">{user.eloRating}</span><span className="profile__stat-label">Overall Elo</span></div>
        <div className="profile__stat"><span className="profile__stat-value">{user.recentMatches?.length || 0}</span><span className="profile__stat-label">Games Played</span></div>
        <div className="profile__stat"><span className="profile__stat-value">{stats.wins}</span><span className="profile__stat-label">Total Wins</span></div>
        <div className="profile__stat"><span className="profile__stat-value">{stats.losses}</span><span className="profile__stat-label">Total Losses</span></div>
        <div className="profile__stat"><span className="profile__stat-value">{stats.monthWins}</span><span className="profile__stat-label">Wins (month)</span></div>
        <div className="profile__stat"><span className="profile__stat-value">{stats.monthLosses}</span><span className="profile__stat-label">Losses (month)</span></div>
      </div>

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
              const won = match.winnerId?._id === id || match.winnerId === id;
              const players = match.players || [];
              const opponent = players.find((p) => {
                const pId = p.userId?._id || p.userId;
                return pId !== id;
              })?.userId;
              return (
                <Link to={`/game/${match._id}`} key={match._id} className="profile__game">
                  <span className={`profile__result profile__result--${won ? "win" : "loss"}`}>{won ? "Win" : "Loss"}</span>
                  <span className="profile__opponent">vs {opponent?.username || "Unknown"}</span>
                  <span className="profile__game-variant">{match.category?.timeControl}s</span>
                  <span className="profile__game-date">{new Date(match.updatedAt).toLocaleDateString()}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
