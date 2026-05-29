import { useState, useEffect, useCallback } from "react";
import { getAllUsers, banUser, makeAdmin } from "../../../services/users-service.js";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const LIMIT = 20;

  const fetchUsers = useCallback(async (searchTerm, pageNum) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsers(searchTerm, pageNum, LIMIT);
      setUsers(data.results || []);
      setHasMore((data.results || []).length === LIMIT);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(search, page);
  }, [fetchUsers, search, page]);

  function handleSearch(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  async function handleBan(id) {
    if (!confirm("Ban this user?")) return;
    try {
      await banUser(id);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isBanned: true } : u));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleMakeAdmin(id) {
    if (!confirm("Promote this user to admin?")) return;
    try {
      await makeAdmin(id);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, role: "admin" } : u));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="admin-users">
      <h1 className="admin-users__title">User Administration</h1>

      <div className="admin-users__toolbar">
        <input
          className="admin-users__search"
          type="text"
          placeholder="Search by username or email..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      {error && <p className="admin-users__error">{error}</p>}

      <div className="admin-users__table-wrap">
        <table className="admin-users__table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="admin-users__cell--center">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="admin-users__cell--center">No users found.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className={u.isBanned ? "admin-users__row--banned" : ""}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`admin-users__badge admin-users__badge--${u.role}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.isBanned
                      ? <span className="admin-users__badge admin-users__badge--banned">Banned</span>
                      : <span className="admin-users__badge admin-users__badge--active">Active</span>
                    }
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="admin-users__actions">
                    {!u.isBanned && (
                      <button
                        className="btn btn--red"
                        onClick={() => handleBan(u._id)}
                      >
                        Ban
                      </button>
                    )}
                    {u.role !== "admin" && (
                      <button
                        className="btn btn--primary"
                        onClick={() => handleMakeAdmin(u._id)}
                      >
                        Make Admin
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-users__pagination">
        <button
          className="btn btn--secondary"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </button>
        <span className="admin-users__page">Page {page}</span>
        <button
          className="btn btn--secondary"
          disabled={!hasMore}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
