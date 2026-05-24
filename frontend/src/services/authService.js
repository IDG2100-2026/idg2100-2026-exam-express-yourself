import { apiFetch } from "../api.js";
import { setAccessToken, clearAccessToken } from "./tokenManager.js";

export const registerUser = async (userData) => {
  return await apiFetch("/auth/register", {
    // fetch register endpoint, and get the form data in a json string
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const loginUser = async (credentials) => {
  const loginData = await apiFetch("/auth/login", {
    // fetch the login endpoint, and get the form data in a json string
    method: "POST",
    body: JSON.stringify(credentials),
  });
  return loginData;
};

export const logoutUser = async () => {
  try {
    await apiFetch("/auth/sessions/current", {
      // deletes session from db
      method: "DELETE",
    });
  } finally {
    clearAccessToken(); // deletes access token from client side
  }
};

export const verifyEmail = async (code) => { // Had to be hardcoded because apiFetch tries to give access token, but we don't have that yet
  const API_URL = "http://localhost:3000/api/auth";
  const response = await fetch(`${API_URL}/verify-email?code=${code}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Verification failed");
  return data;
};
