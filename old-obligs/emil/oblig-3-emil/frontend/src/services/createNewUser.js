import { apiFetch } from '../../api.js';



export async function registerUser(userdata){
    return await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(userdata)
    });
}
