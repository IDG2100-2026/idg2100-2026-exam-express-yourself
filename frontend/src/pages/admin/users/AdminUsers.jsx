import { useState, useEffect, useCallback } from "react";
import {
  getAllUsers,
  banUser,
  makeAdmin,
  unBannUser,
  unMakeAdmin,
} from "../../../services/users-service.js";
import ConfirmModal from "../../../components/confirm-modal/ConfirmModal.jsx";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

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

  function handleBan(id) {
    setConfirmModal({
      message: "Ban this user?",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await banUser(id);
          setUsers((prev) => {
            return prev.map((user) => {
              if (user._id === id) { return { ...user, isBanned: true }; }
              return user;
            });
          });
        } catch (err) {
          setError(err.message);
        }
      },
    });
  }

  function handleUnBan(id) {
    setConfirmModal({
      message: "Un-ban this user?",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await unBannUser(id);
          setUsers((prev) => {
            return prev.map((user) => {
              if (user._id === id) { return { ...user, isBanned: false }; }
              return user;
            });
          });
        } catch (err) {
          setError(err.message);
        }
      },
    });
  }

  function handleMakeAdmin(id) {
    setConfirmModal({
      message: "Promote this user to admin?",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await makeAdmin(id);
          setUsers((prev) => {
            return prev.map((user) => {
              if (user._id === id) { return { ...user, role: "admin" }; }
              return user;
            });
          });
        } catch (err) {
          setError(err.message);
        }
      },
    });
  }

  function handleUnmakeAdmin(id) {
    setConfirmModal({
      message: "Remove admin from this user?",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await unMakeAdmin(id);
          setUsers((prev) => {
            return prev.map((user) => {
              if (user._id === id) { return { ...user, role: "user" }; }
              return user;
            });
          });
        } catch (err) {
          setError(err.message);
        }
      },
    });
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
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => { setConfirmModal(null); }}
        />
      )}
    </div>
  );
}
