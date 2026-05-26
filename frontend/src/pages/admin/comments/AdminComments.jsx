import { useState, useEffect } from "react";
import { getAllComments, deleteComment } from "../../../services/comments-service.js";
import "./admin-comments.scss";

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllComments()
      .then(setComments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="admin-comments">
      <h1 className="admin-comments__title">Comment Administration</h1>

      {error && <p className="admin-comments__error">{error}</p>}

      {loading ? (
        <p className="admin-comments__muted">Loading...</p>
      ) : comments.length === 0 ? (
        <p className="admin-comments__muted">No comments found.</p>
      ) : (
        <div className="admin-comments__list">
          {comments.map((c) => (
            <div key={c._id} className="admin-comments__item">
              <div className="admin-comments__meta">
                <span className="admin-comments__author">
                  {c.authorId?.username || "Unknown user"}
                </span>
                <span className="admin-comments__target">
                  {c.targetType} · {c.targetId}
                </span>
                <span className="admin-comments__date">
                  {new Date(c.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="admin-comments__text">{c.text}</p>
              <button
                className="admin-comments__delete"
                onClick={() => handleDelete(c._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
