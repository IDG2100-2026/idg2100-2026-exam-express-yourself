import { apiFetch } from "../api.js";

export async function loginUser(username, password) { //send login input to backend
    return await apiFetch("/users/login", {
        method: "POST",
        body: JSON.stringify({ username, password }) //convert to string for req body
    });
}

export async function getUser(id) { //fetch user by id
    return await apiFetch("/users/" + id, {
        method: "GET"
    });
}

export async function updateUser(id, userData) { //update user by id
    return await apiFetch("/users/" + id, {
        method: "PATCH",
        body: JSON.stringify(userData)
    });
}

export async function registerUser(userData) { //register new user
    return await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify(userData)
    });
}
