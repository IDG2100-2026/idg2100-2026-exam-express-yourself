import { apiFetch } from '../../api.js';


export async function updateUserProfile(userId){
    return await apiFetch(`/users/:${userId}/update-profile`);
}
