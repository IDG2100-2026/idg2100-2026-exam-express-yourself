import { apiFetch } from "../api.js";

export async function loginUser(email, password) {
  return await apiFetch("/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(userData) {
  return await apiFetch("/users/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function getUser(id) {
  return await apiFetch(`/users/${id}`, { method: "GET" });
}

export async function updateUser(id, updates) {
  return await apiFetch(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}
