import { apiFetch } from "../../api.js";

export async function loginUser(credentials) {
  return await apiFetch("/users/login", { 
    method: 'POST',
    body: JSON.stringify(credentials)
  });
}

export async function registerUser(userData) {
  return await apiFetch("/users/register", {
    method: 'POST',
    body: JSON.stringify(userData)
  });''
}

export async function getUser(userId) {
  return await apiFetch(`/users/${userId}`);
}

export async function updateUser(userId, updates) {
  const role = localStorage.getItem('role')
  return await apiFetch(`/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'x-user-id': userId,
      'x-user-type': role || 'user'
    },
    body: JSON.stringify(updates)
  });
}
