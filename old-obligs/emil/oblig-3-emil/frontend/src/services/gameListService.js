import { apiFetch } from '../../api.js';


export async function getGamesList(){
    return await apiFetch("/games?limit=100", {});
};