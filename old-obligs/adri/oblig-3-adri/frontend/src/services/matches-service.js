import { apiFetch } from "../api.js";

export async function getMatches() { //fetch all matches
    return await apiFetch("/matches", {
        method: "GET"
    });
}

export async function createMatch(matchData) { //create match
    return await apiFetch("/matches", {
        method: "POST",
        body: JSON.stringify(matchData)
    });
}

export async function getMatch(id) {
    return await apiFetch("/matches/" + id, { //fetch one match by id
        method: "GET"
    });
}

export async function updateMatch(id, matchData) {
    return await apiFetch("/matches/" + id, { //update one match by its id
        method: "PATCH",
        body: JSON.stringify(matchData)
    });
}
