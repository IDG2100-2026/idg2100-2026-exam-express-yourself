import { useState, useEffect } from "react";
import {
  getAllComments,
  deleteComment,
} from "../../../services/comments-service.js";
import ConfirmModal from "../../../components/confirm-modal/ConfirmModal.jsx";
import Avatar from "../../../components/avatar/Avatar.jsx";

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

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

  function handleDelete(id) {
    setConfirmModal({
      message: "Delete this comment?",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await deleteComment(id);
          setComments((prev) => {
            return prev.filter((comment) => {
              return comment._id !== id;
            });
          });
        } catch (err) {
          setError(err.message);
        }
      },
    });
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
                <div className="admin-comments__meta stack-s">
                  <div className="admin-comments__author">
                    <Avatar
                      imageUrl={comment.authorId?.profileImageUrl}
                      username={comment.authorId?.username}
                      size={24}
                    />
                    <span>{comment.authorId?.username || "Unknown user"}</span>
                  </div>
                  <div className="admin-comments__info">
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
