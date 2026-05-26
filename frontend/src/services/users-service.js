import { apiFetch } from "../api.js";
import { getAccessToken } from "./token-manager.js";

const API_URL = `${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_HOSTNAME}:${import.meta.env.VITE_BACKEND_PORT}/api`;

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

export async function uploadAvatar(id, file) {
  const token = getAccessToken();
  const body = new FormData();
  body.append("avatar", file);
  const response = await fetch(`${API_URL}/users/${id}/avatar`, {
    method: "PATCH",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
    body,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.error || "Failed to upload avatar");
  return result;
}