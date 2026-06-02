import { apiFetch, fetchWithoutAccesstoken } from "../api.js";
import { clearAccessToken } from "./token-manager.js";

export const registerUser = async (userData) => {
  return await apiFetch("/auth/register", {
    // fetch register endpoint, and get the form data in a json string
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const loginUser = async (credentials) => {
  const loginData = await fetchWithoutAccesstoken("/auth/login", {
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

export const verifyEmail = async (code) => {
  // Had to be hardcoded because apiFetch tries to give access token, but we don't have that yet
  return await fetchWithoutAccesstoken(`/auth/verify-email?code=${code}`);
};

export const resendVerifyEmail = async (email) => {
  return await fetchWithoutAccesstoken("/auth/resend-verify-email", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export const requestResetPassword = async (email) => {
  return await fetchWithoutAccesstoken("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = async (code, newPassword) => {
  return await fetchWithoutAccesstoken("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ code, newPassword }),
  });
};
