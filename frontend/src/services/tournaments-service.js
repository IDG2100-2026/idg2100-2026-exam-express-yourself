import { apiFetch } from "../api.js";
import { getAccessToken } from "./token-manager.js";

const API_URL = `${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_HOSTNAME}:${import.meta.env.VITE_BACKEND_PORT}/api`;

export async function getTournaments({ page = 1, limit = 9, search, status, sort } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (search && search.length >= 3) params.set("search", search);
  if (status && status !== "all") params.set("status", status);
  if (sort) params.set("sort", sort);
  return await apiFetch(`/tournaments?${params}`, { method: "GET" });
}

export async function getTournament(id) {
  return await apiFetch(`/tournaments/${id}`, { method: "GET" });
}

export async function joinTournament(id) {
  return await apiFetch(`/tournaments/${id}/join`, { method: "POST" });
}

export async function leaveTournament(id) {
  return await apiFetch(`/tournaments/${id}/leave`, { method: "POST" });
}

export async function createTournament(formData) {
  const token = getAccessToken();
  const response = await fetch(`${API_URL}/tournaments`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.errors?.[0]?.msg || result?.error || "Failed to create tournament");
  return result;
}

export async function updateTournament(id, data) {
  return await apiFetch(`/tournaments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getStandings(id) {
  return await apiFetch(`/tournaments/${id}/standings`, { method: "GET" });
}

export async function startTournament(id) {
  return await apiFetch(`/tournaments/${id}/start`, { method: "POST" });
}

export async function cancelTournament(id) {
  return await apiFetch(`/tournaments/${id}/cancel`, { method: "POST" });
}

export async function deleteTournament(id) {
  return await apiFetch(`/tournaments/${id}`, { method: "DELETE" });
}
