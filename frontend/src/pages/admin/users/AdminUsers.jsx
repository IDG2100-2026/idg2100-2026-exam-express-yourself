import { useState, useEffect, useCallback } from "react";
import {
  getAllUsers,
  banUser,
  makeAdmin,
  unBannUser,
  unMakeAdmin,
} from "../../../services/users-service.js";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [disabledBtn] = useState(true);

  const fetchUsers = useCallback(async (searchTerm, pageNum, limitUsers) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllUsers(searchTerm, pageNum, limitUsers);
      const results = data.results ? data.results : [];
      setUsers(results);
      setHasMore(results.length === limitUsers);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(search, page, limit);
  }, [fetchUsers, search, page, limit]);

  function handleSearch(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  async function handleBan(id) {
    if (!confirm("Ban this user?")) return;
    try {
      await banUser(id);
      setUsers((prev) => {
        prev.map((user) =>
          user._id === id ? { ...user, isBanned: true } : user,
        );
      });
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleUnBan(id) {
    if (!confirm("Un-Ban this user?")) return;
    try {
      await unBannUser(id);
      setUsers((prev) =>
        prev.map((user) =>
          user._id === id ? { ...user, isBanned: false } : user,
        ),
      );
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleMakeAdmin(id) {
    if (!confirm("Promote this user to admin?")) return;
    try {
      await makeAdmin(id);
      setUsers((prev) => {
        prev.map((user) =>
          user._id === id ? { ...user, role: "admin" } : user,
        );
      });
    } catch (err) {
      alert(err.message);
    }
  }
  async function handleUnmakeAdmin(id) {
    if (!confirm("Unmake this user as admin")) return;
    try {
      await unMakeAdmin(id);
      setUsers((prev) => {
        prev.map((user) =>
          user._id === id ? { ...user, role: "user" } : user,
        );
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
              <tr>
                <td colSpan={6} className="admin-users__cell--center">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-users__cell--center">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                return (
                  <tr
                    key={user._id}
                    className={user.isBanned ? "admin-users__row--banned" : ""}
                  >
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={`admin-users__badge admin-users__badge--${user.role}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.isBanned ? (
                        <span className="admin-users__badge admin-users__badge--banned">
                          Banned
                        </span>
                      ) : (
                        <span className="admin-users__badge admin-users__badge--active">
                          Active
                        </span>
                      )}
                    </td>
                    <td>
                      {new Date(user.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td>
                      <div className="admin-users__actions">
                        {user.role !== "admin" &&
                          (!user.isBanned ? (
                            <button
                              className="btn btn--red"
                              onClick={() => {
                                handleBan(user._id);
                              }}
                            >
                              Ban
                            </button>
                          ) : (
                            <button
                              className="btn btn--red"
                              onClick={() => {
                                handleUnBan(user._id);
                              }}
                            >
                              Un-ban
                            </button>
                          ))}
                        {user.username !== "admin" &&
                          (user.role !== "admin" ? (
                            <button
                              className="btn btn--primary"
                              disabled={user.isBanned}
                              onClick={() => {
                                handleMakeAdmin(user._id);
                              }}
                            >
                              Make admin
                            </button>
                          ) : (
                            <button
                              className="btn btn--primary"
                              onClick={() => {
                                handleUnmakeAdmin(user._id);
                              }}
                            >
                              Un-make admin
                            </button>
                          ))}
                      </div>
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
          onClick={() => {
            setPage((prevPage) => {
              return prevPage - 1;
            });
          }}
        >
          Previous
        </button>
        <span className="admin-users__page">Page {page}</span>
        <button
          className="btn btn--secondary"
          disabled={!hasMore}
          onClick={() => {
            setPage((prevPage) => {
              return prevPage + 1;
            });
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
