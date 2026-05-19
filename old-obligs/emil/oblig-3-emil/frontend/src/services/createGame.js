import { apiFetch } from "../../api";

export async function createGame(gameData, user) {
  return await apiFetch("/games", {
    method: "POST",
    headers: {
      "user-type": user ? "registered" : "anonymous", 
      "user-id": user?.id || "",
      "user-elo": user?.eloRating?.toString() || "",
    },
    body: JSON.stringify(gameData),
  });
}
