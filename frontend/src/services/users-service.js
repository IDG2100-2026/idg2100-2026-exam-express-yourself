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

export async function getAllUsers(search = "", page = 1, limit = 20) {
  let query = `?page=${page}&limit=${limit}`;
  if (search) query += `&search=${encodeURIComponent(search)}`;
  return await apiFetch(`/users${query}`, { method: "GET" });
}

export async function banUser(id) {
  return await apiFetch(`/users/${id}/ban`, { method: "POST" });
}

export async function makeAdmin(id) {
  return await apiFetch(`/users/${id}/make-admin`, { method: "POST" });
}