import { apiFetch } from "../../api"

export async function joinGame(gameId, user){
    return await apiFetch(`/games/${gameId}/join`, {
        method: 'POST',
        headers: {
            "user-type": user ? "registered" : "anonymous", // if user is true, then usertype is registered! 
            "user-id": user?.id || "" // Tells which user that is joining the game. 
        }
    })
}

