import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useUser } from "../../hooks/useUser.js";
import { useAuth } from "../../hooks/useAuth.js";
import { updateUser, uploadAvatar } from "../../services/users-service.js";
import { getPlayerMatches } from "../../services/matches-service.js";

export default function Profile() {
  const { id } = useParams();
  const { user: authUser } = useAuth();
  const { user, isLoading, error, refetch } = useUser(id);

  const userId = authUser?._id || authUser?.userId;
  const isOwnProfile = userId === id;

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    bio: "",
    password: "",
    newPassword: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);

  const [games, setGames] = useState([]);
  const [gamesPage, setGamesPage] = useState(1);
  const [gamesTotal, setGamesTotal] = useState(0);
  const [isLoadingGames, setIsLoadingGames] = useState(false);

  useEffect(() => {
    if (user?.recentMatches) {
      setGames(user.recentMatches);
      setGamesTotal(user.recentMatchesTotal || 0);
      setGamesPage(1);
    }
  }, [user]);

  function loadMoreGames() {
    const nextPage = gamesPage + 1;
    setIsLoadingGames(true);
    getPlayerMatches(id, nextPage, 10)
      .then((data) => {
        setGames((prev) => [...prev, ...(data.results || [])]);
        setGamesTotal(data.total || 0);
        setGamesPage(nextPage);
      })
      .finally(() => setIsLoadingGames(false));
  }

  function startEditing() {
    setFormData({
      email: user?.email || "",
      bio: user?.bio || "",
      password: "",
      newPassword: "",
    });
    setAvatarFile(null);
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

    if (formData.newPassword && formData.password === formData.newPassword) {
      return setSaveError("New password must differ from old password.");
    }

    try {
      if (avatarFile) {
        await uploadAvatar(id, avatarFile);
      }

      const updates = {
        ...(formData.email && { email: formData.email }),
        bio: formData.bio,
        ...(formData.newPassword && {
          password: formData.newPassword,
          oldPassword: formData.password,
        }),
      };

      await updateUser(id, updates);
      refetch();
      setEditing(false);
    } catch (err) {
      setSaveError(err.message);
    }
  }

  function calcStats(matches) {
    if (!matches || matches.length === 0)
      return { wins: 0, losses: 0, monthWins: 0, monthLosses: 0 };
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    let wins = 0,
      losses = 0,
      monthWins = 0,
      monthLosses = 0;
    matches.forEach((m) => {
      const won = m.winnerId?._id === id || m.winnerId === id;
      if (won) wins++;
      else losses++;
      if (new Date(m.updatedAt) >= oneMonthAgo) {
        if (won) monthWins++;
        else monthLosses++;
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
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={user.username}
              className="profile__avatar-img"
            />
          ) : (
            <span>{user.username.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="profile__info">
          <h1 className="profile__username">{user.username}</h1>
          {isOwnProfile && <p className="profile__email">{user.email}</p>}
          <p className="profile__bio">{user.bio || "No bio yet."}</p>
          {isOwnProfile && (
            <button
              className="profile__edit-btn"
              onClick={editing ? () => setEditing(false) : startEditing}
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          )}
        </div>
      </div>

      {editing && (
        <form className="profile__form" onSubmit={handleSave}>
          <h2 className="profile__form-title">Edit Profile</h2>
          <div className="profile__field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="profile__field">
            <label>Profile image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files[0] || null)}
            />
          </div>
          <div className="profile__field">
            <label>About Me</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              maxLength={300}
            />
          </div>
          <div className="profile__field">
            <label htmlFor="password">Old Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>
          <div className="profile__field">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>
          {saveError && <p className="profile__error">{saveError}</p>}
          {saveSuccess && <p className="profile__success">{saveSuccess}</p>}
          <button type="submit" className="profile__save-btn">
            Save Changes
          </button>
        </form>
      )}

      <div className="profile__stats">
        <div className="profile__stat">
          <span className="profile__stat-value">{user.eloRating?.tc10 ?? 1000}</span>
          <span className="profile__stat-label">Elo (10s)</span>
        </div>
        <div className="profile__stat">
          <span className="profile__stat-value">{user.eloRating?.tc30 ?? 1000}</span>
          <span className="profile__stat-label">Elo (30s)</span>
        </div>
        <div className="profile__stat">
          <span className="profile__stat-value">{user.eloRating?.tc90 ?? 1000}</span>
          <span className="profile__stat-label">Elo (90s)</span>
        </div>
        <div className="profile__stat">
          <span className="profile__stat-value">{user.points ?? 0}</span>
          <span className="profile__stat-label">Points</span>
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

      {user.trophies?.length > 0 && (
        <div className="profile__trophies">
          <h2 className="profile__section-title">Trophies</h2>
          <div className="profile__trophy-list">
            {user.trophies.map((trophy, i) => (
              <div key={i} className="profile__trophy">
                {trophy.imageUrl && (
                  <img src={trophy.imageUrl} alt={trophy.title} />
                )}
                <span>{trophy.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="profile__games">
        <h2 className="profile__section-title">Game History</h2>
        {games.length === 0 ? (
          <p className="profile__status">No games played yet.</p>
        ) : (
          <div className="profile__game-list">
            {games.map((match) => {
              const won = match.winnerId?._id === id || match.winnerId === id;
              const opponent = (match.players || []).find((p) => {
                const pId = p.userId?._id || p.userId;
                return pId !== id;
              })?.userId;
              return (
                <Link
                  to={`/game/${match._id}`}
                  key={match._id}
                  className="profile__game"
                >
                  <span className={`profile__result profile__result--${won ? "win" : "loss"}`}>
                    {won ? "Win" : "Loss"}
                  </span>
                  <span className="profile__opponent">
                    vs {opponent?.username || "Unknown"}
                  </span>
                  <span className="profile__game-variant">
                    {match.category?.timeControl}s · BO{match.category?.rounds}
                  </span>
                  <span className="profile__game-date">
                    {new Date(match.updatedAt).toLocaleDateString()}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
        {(games.length === 10 || gamesTotal > games.length) && (
          <button
            className="profile__load-more"
            onClick={loadMoreGames}
            disabled={isLoadingGames}
          >
            {isLoadingGames ? "Loading..." : "Load more games"}
          </button>
        )}
      </div>
    </div>
  );
}
