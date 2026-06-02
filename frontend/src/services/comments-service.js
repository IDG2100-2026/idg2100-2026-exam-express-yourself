import { apiFetch } from "../api.js";


export async function getAllComments() {
  return await apiFetch("/comments", { method: "GET" });
}

export async function deleteComment(id) {
  return await apiFetch(`/comments/${id}`, { method: "DELETE" });
}
