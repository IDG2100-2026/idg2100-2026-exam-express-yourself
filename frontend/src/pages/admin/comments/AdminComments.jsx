import { useState, useEffect } from "react";
import {
  getAllComments,
  deleteComment,
} from "../../../services/comments-service.js";

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllComments()
      .then((data) => {
        setComments(data.results);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteComment(id);
      setComments((prev) => {
        return prev.filter((comment) => {
          return comment._id !== id;
        });
      });
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="admin-comments stack-l">
      <h1>Comment administration</h1>

      {error && <p className="admin-comments__error">{error}</p>}

      {isLoading ? (
        <p className="admin-comments__muted">Loading...</p>
      ) : comments.length === 0 ? (
        <p className="admin-comments__muted">No comments found.</p>
      ) : (
        <ul className="admin-comments__list stack-m">
          {comments.map((comment) => {
            return (
              <li key={comment._id} className="admin-comments__item stack-s">
                <div className="admin-comments__meta">
                  <span className="admin-comments__author">
                    {comment.authorId?.username || "Unknown user"}
                  </span>
                  <span className="admin-comments__target">
                    {comment.targetType}, {comment.targetId}
                  </span>
                  <span className="admin-comments__date">
                    {new Date(comment.createdAt).toLocaleString("en-GB", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="admin-comments__text">{comment.text}</p>
                <button
                  className="btn btn--red"
                  onClick={() => {
                    handleDelete(comment._id);
                  }}
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
