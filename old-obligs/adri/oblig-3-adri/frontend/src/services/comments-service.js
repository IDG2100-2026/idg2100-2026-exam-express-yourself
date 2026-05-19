import { apiFetch } from "../api.js";

export async function getComments(matchId) {
    return await apiFetch("/comments?matchId=" + matchId, { //query param tells backend what match to filter by
        method: "GET"
    });
}

export async function createComment(commentData) {
    return await apiFetch("/comments", {
        method: "POST",
        headers: {
            role: "user" //backend blocks anonymous user from posting comment
        },
        body: JSON.stringify(commentData)
    });
}
