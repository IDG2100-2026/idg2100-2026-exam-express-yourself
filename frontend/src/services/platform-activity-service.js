import { apiFetch } from "../api.js";

export async function getPlatformActivity() {
  return await apiFetch("/platform-activity", { method: "GET" });
}
