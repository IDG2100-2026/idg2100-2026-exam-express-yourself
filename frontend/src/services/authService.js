
// export async function loginUser(email, password) {
//   return await apiFetch("/auth/login", {
//     method: "POST",
//     body: JSON.stringify({ email, password }),
//   });
// } // TODO: delete after we don't need

// export async function registerUser(userData) {
//   return await apiFetch("/auth/register", {
//     method: "POST",
//     body: JSON.stringify(userData),
//   });
// }// TODO: delete after we don't need

import { apiFetch } from "../api.js";
import { setAccessToken, clearAccessToken } from "./tokenManager.js";

export const registerUser = async (userData) => {
    return await apiFetch("/auth/register", {
        method: 'POST',
        body: JSON.stringify(userData)
    });
};

export const loginUser = (credentials) => {
    const loginData =  await apiFetch("/auth/login", {
        method: 'POST',
        body: JSON.stringify(credentials)
    });
    setAccessToken(loginData.accessToken);
    return loginData;
}


export const logoutUser = () => {
    try{
        await apiFetch("/sessions/current", { // deletes session from db
            method: 'DELETE'
        });
    }finally{
        clearAccessToken(); // deletes access token from client side
    }
}

