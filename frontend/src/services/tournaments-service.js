import { apiFetch } from "../api.js";

export async function getTournaments(page = 1, limit = 20) {
  return await apiFetch(`/tournaments?page=${page}&limit=${limit}`, { method: "GET" });
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
