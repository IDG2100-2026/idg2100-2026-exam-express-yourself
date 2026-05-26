import { apiFetch } from "../api.js";

export async function getSecurityIncidents() {
  return await apiFetch("/security-incidents", { method: "GET" });
}
