import { apiFetch } from "../api.js";

export async function getComments(targetType, targetId) {
  return await apiFetch(
    `/comments?targetType=${targetType}&targetId=${targetId}`,
    { method: "GET" },
  );
}

export async function createComment(text, targetType, targetId) {
  return await apiFetch("/comments", {
    method: "POST",
    body: JSON.stringify({ text, targetType, targetId }),
  });
}

export async function getAllComments() {
  return await apiFetch("/comments", { method: "GET" });
}

export async function deleteComment(id) {
  return await apiFetch(`/comments/${id}`, { method: "DELETE" });
}
