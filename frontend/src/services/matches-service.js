import { apiFetch } from "../api.js";

export async function getMatches(status, page = 1, limit = 20) {
  let query = `?page=${page}&limit=${limit}`;
  if (status) query += `&status=${status}`;
  return await apiFetch(`/matches${query}`, { method: "GET" });
}

export async function getPlayerMatches(playerId, page = 1, limit = 50) {
  return await apiFetch(
    `/matches?playerId=${playerId}&page=${page}&limit=${limit}`,
    { method: "GET" },
  );
}

export async function getMatch(id) {
  return await apiFetch(`/matches/${id}`, { method: "GET" });
}

export async function createMatch(matchData) {
  return await apiFetch("/matches", {
    method: "POST",
    body: JSON.stringify(matchData),
  });
}

export async function joinMatch(id) {
  return await apiFetch(`/matches/${id}/join`, { method: "POST" });
}

export async function leaveMatch(id) {
  return await apiFetch(`/matches/${id}/leave`, { method: "POST" });
}
