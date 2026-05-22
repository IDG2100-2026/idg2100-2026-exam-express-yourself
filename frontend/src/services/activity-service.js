import { apiFetch } from "../api.js";

export async function getActivity() {
  return await apiFetch("/activity", { method: "GET" });
}
