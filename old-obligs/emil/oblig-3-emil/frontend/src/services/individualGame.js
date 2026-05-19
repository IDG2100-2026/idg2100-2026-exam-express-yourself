import { apiFetch } from "../../api";

export async function getGame(gameId){
    return await apiFetch(`/games/${gameId}`)
}