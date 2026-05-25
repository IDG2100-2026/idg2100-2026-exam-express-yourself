import { apiFetch } from "../api.js";

export async function getUser(id) {
  return await apiFetch(`/users/${id}`, { method: "GET" });
}

export async function updateUser(id, updates) {
  return await apiFetch(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}