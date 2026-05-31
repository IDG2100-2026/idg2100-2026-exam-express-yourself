import { useState, useEffect, useCallback } from "react";
import { getAllUsers, banUser, makeAdmin } from "../../../services/users-service.js";

const LIMIT = 20;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (searchTerm, pageNum) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllUsers(searchTerm, pageNum, LIMIT);
      const results = data.results ? data.results : [];
      setUsers(results);
      setHasMore(results.length === LIMIT);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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
      setUsers((prev) => {
        return prev.map((user) => {
          if (user._id === id) {
            return { ...user, isBanned: true };
          }
          return user;
        });
      });
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleMakeAdmin(id) {
    if (!confirm("Promote this user to admin?")) return;
    try {
      await makeAdmin(id);
      setUsers((prev) => {
        return prev.map((user) => {
          if (user._id === id) {
            return { ...user, role: "admin" };
          }
          return user;
        });
      });
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="admin-users stack-l">
      <h1>Manage users</h1>

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
            {isLoading ? (
              <tr><td colSpan={6} className="admin-users__cell--center">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="admin-users__cell--center">No users found.</td></tr>
            ) : (
              users.map((user) => {
                return (
                  <tr key={user._id} className={user.isBanned ? "admin-users__row--banned" : ""}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`admin-users__badge admin-users__badge--${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.isBanned
                        ? <span className="admin-users__badge admin-users__badge--banned">Banned</span>
                        : <span className="admin-users__badge admin-users__badge--active">Active</span>
                      }
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString("en-GB")}</td>
                    <td className="admin-users__actions">
                      {!user.isBanned && (
                        <button
                          className="btn btn--red"
                          onClick={() => { handleBan(user._id); }}
                        >
                          Ban
                        </button>
                      )}
                      {user.role !== "admin" && (
                        <button
                          className="btn btn--primary"
                          onClick={() => { handleMakeAdmin(user._id); }}
                        >
                          Make admin
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-users__pagination">
        <button
          className="btn btn--secondary"
          disabled={page === 1}
          onClick={() => { setPage((prevPage) => { return prevPage - 1; }); }}
        >
          Previous
        </button>
        <span className="admin-users__page">Page {page}</span>
        <button
          className="btn btn--secondary"
          disabled={!hasMore}
          onClick={() => { setPage((prevPage) => { return prevPage + 1; }); }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
