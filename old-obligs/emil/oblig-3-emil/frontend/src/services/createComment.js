import { apiFetch } from "../../api";

export async function createComment(gameId, userId, comment){
    return await apiFetch(`/games/${gameId}/comments`, {
        method: 'POST',
        headers: {
            "user-type": "registered", // Only registered users can comment. 
            "user-id": userId 
        },
        body: JSON.stringify({ userId, comment })
    })
}