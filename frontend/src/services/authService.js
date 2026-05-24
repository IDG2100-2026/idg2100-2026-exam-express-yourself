import { apiFetch } from "../api.js";
import { setAccessToken, clearAccessToken } from "./tokenManager.js";

export const registerUser = async (userData) => {
    return await apiFetch("/auth/register", {
        method: 'POST',
        body: JSON.stringify(userData)
    });
};

export const loginUser = async (credentials) => {
    const loginData =  await apiFetch("/auth/login", {
        method: 'POST',
        body: JSON.stringify(credentials)
    });
    return loginData;
}


export const logoutUser = async () => {
    try{
        await apiFetch("/auth/sessions/current", { // deletes session from db
            method: 'DELETE'
        });
    }finally{
        clearAccessToken(); // deletes access token from client side
    }
}

