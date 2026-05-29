import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPlatformActivity } from "../../../services/platform-activity-service.js";
import { getSecurityIncidents } from "../../../services/security-incidents-service.js";

export default function AdminDashboard() {
  const [activity, setActivity] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPlatformActivity()
      .then(setActivity)
      .catch((err) => setError(err.message));

    getSecurityIncidents()
      .then(setIncidents)
      .catch(() => {});
  }, []);

  return (
    <div className="admin-dashboard">
      <h1 className="admin-dashboard__title">Dashboard</h1>

      {error && <p className="admin-dashboard__error">{error}</p>}

      <section className="admin-dashboard__section">
        <h2>Platform Activity</h2>
        {activity ? (
          <div className="admin-dashboard__stats">
            <div className="admin-dashboard__stat">
              <span className="admin-dashboard__stat-value">{activity.activePlayers}</span>
              <span className="admin-dashboard__stat-label">Active players this week</span>
            </div>
            <div className="admin-dashboard__stat">
              <span className="admin-dashboard__stat-value">{activity.gamesThisWeek}</span>
              <span className="admin-dashboard__stat-label">Games this week</span>
            </div>
            <div className="admin-dashboard__stat">
              <span className="admin-dashboard__stat-value">{activity.ongoingMatches}</span>
              <span className="admin-dashboard__stat-label">Games in progress</span>
            </div>
            <div className="admin-dashboard__stat">
              <span className="admin-dashboard__stat-value">{activity.availableGames}</span>
              <span className="admin-dashboard__stat-label">Open games</span>
            </div>
            <div className="admin-dashboard__stat">
              <span className="admin-dashboard__stat-value">{activity.newProfiles}</span>
              <span className="admin-dashboard__stat-label">New profiles this week</span>
            </div>
          </div>
        ) : (
          !error && <p className="admin-dashboard__loading">Loading...</p>
        )}
      </section>

      <section className="admin-dashboard__section">
        <h2>Security Incidents</h2>
        {incidents.length === 0 ? (
          <p className="admin-dashboard__muted">No incidents recorded.</p>
        ) : (
          <div className="admin-dashboard__incidents">
            {incidents.map((inc) => (
              <div key={inc._id} className={`admin-dashboard__incident admin-dashboard__incident--${inc.type}`}>
                <span className="admin-dashboard__incident-type">{inc.type}</span>
                <span className="admin-dashboard__incident-ip">IP: {inc.ip}</span>
                <span className="admin-dashboard__incident-agent">{inc.userAgent}</span>
                {inc.userId && <span className="admin-dashboard__incident-user">User: {inc.userId.username || inc.userId}</span>}
                <span className="admin-dashboard__incident-time">{new Date(inc.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="admin-dashboard__section">
        <h2>Admin Pages</h2>
        <div className="admin-dashboard__links">
          <Link to="/admin/users" className="admin-dashboard__card">
            <h3>User Administration</h3>
            <p>Search, ban, and promote users</p>
          </Link>
          <Link to="/admin/comments" className="admin-dashboard__card">
            <h3>Comment Administration</h3>
            <p>View and delete comments</p>
          </Link>
          <Link to="/admin/tournament/create" className="admin-dashboard__card">
            <h3>Create Tournament</h3>
            <p>Set up a new tournament</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
