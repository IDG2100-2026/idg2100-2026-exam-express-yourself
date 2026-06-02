import { useState, useEffect } from "react";
import { Link } from "react-router";
import { getPlatformActivity } from "../../../services/platform-activity-service.js";
import { getSecurityIncidents } from "../../../services/security-incidents-service.js";

export default function AdminDashboard() {
  const [activity, setActivity] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPlatformActivity()
      .then(setActivity)
      .catch((err) => { setError(err.message); });

    getSecurityIncidents()
      .then(setIncidents)
      .catch(() => {});
  }, []);

  return (
    <div className="admin-dashboard stack-l">
      <title>Admin Dashboard</title>
      <h1>Dashboard</h1>

      {error && <p className="admin-dashboard__error">{error}</p>}

      <section className="admin-dashboard__section stack-m">
        <h2>Platform activity</h2>
        {activity ? (
          <ul className="admin-dashboard__stats">
            <li className="admin-dashboard__stat">
              <span className="admin-dashboard__stat-value">{activity.activePlayers}</span>
              <span className="admin-dashboard__stat-label">Active players this week</span>
            </li>
            <li className="admin-dashboard__stat">
              <span className="admin-dashboard__stat-value">{activity.gamesThisWeek}</span>
              <span className="admin-dashboard__stat-label">Games this week</span>
            </li>
            <li className="admin-dashboard__stat">
              <span className="admin-dashboard__stat-value">{activity.ongoingMatches}</span>
              <span className="admin-dashboard__stat-label">Games in progress</span>
            </li>
            <li className="admin-dashboard__stat">
              <span className="admin-dashboard__stat-value">{activity.availableGames}</span>
              <span className="admin-dashboard__stat-label">Open games</span>
            </li>
            <li className="admin-dashboard__stat">
              <span className="admin-dashboard__stat-value">{activity.newProfiles}</span>
              <span className="admin-dashboard__stat-label">New profiles this week</span>
            </li>
          </ul>
        ) : (
          !error && <p className="admin-dashboard__muted">Loading...</p>
        )}
      </section>

      <section className="admin-dashboard__section stack-m">
        <h2>Security incidents</h2>
        {incidents.length === 0 ? (
          <p className="admin-dashboard__muted">No incidents recorded.</p>
        ) : (
          <ul className="admin-dashboard__incidents stack-s">
            {incidents.map((incident) => {
              return (
                <li key={incident._id} className={`admin-dashboard__incident admin-dashboard__incident--${incident.type}`}>
                  <span className="admin-dashboard__incident-type">{incident.type}</span>
                  <span className="admin-dashboard__incident-ip">IP: {incident.ip}</span>
                  <span className="admin-dashboard__incident-agent">{incident.userAgent}</span>
                  {incident.userId && <span className="admin-dashboard__incident-user">User: {incident.userId.username || incident.userId}</span>}
                  <span className="admin-dashboard__incident-time">
                    {new Date(incident.createdAt).toLocaleString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="admin-dashboard__section stack-m">
        <h2>Admin pages</h2>
        <ul className="admin-dashboard__links">
          <li>
            <Link to="/admin/users" className="admin-dashboard__card">
              <h3>User administration</h3>
              <p>Search, ban, and promote users</p>
            </Link>
          </li>
          <li>
            <Link to="/admin/comments" className="admin-dashboard__card">
              <h3>Comment administration</h3>
              <p>View and delete comments</p>
            </Link>
          </li>
          <li>
            <Link to="/admin/tournament/create" className="admin-dashboard__card">
              <h3>Create tournament</h3>
              <p>Set up a new tournament</p>
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
