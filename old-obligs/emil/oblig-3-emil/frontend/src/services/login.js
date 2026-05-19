import { apiFetch } from "../../api";

export async function loginUser(credentials) {
  return await apiFetch("/login", {
    method: 'POST',
    body: JSON.stringify(credentials), // Turns the user credentials into a json string
  });
}
