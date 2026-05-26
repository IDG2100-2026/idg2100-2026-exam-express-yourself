import { apiFetch } from "../api.js";

export async function getMatches({ status, timeControl, rounds, straightsAllowed, page = 1, limit = 9 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (status) params.set("status", status);
  if (timeControl) params.set("timeControl", timeControl);
  if (rounds) params.set("rounds", rounds);
  if (straightsAllowed !== null && straightsAllowed !== undefined) params.set("straightsAllowed", straightsAllowed);
  return await apiFetch(`/matches?${params}`, { method: "GET" });
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
