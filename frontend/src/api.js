const { VITE_BACKEND_PORT, VITE_BACKEND_HOSTNAME, VITE_BACKEND_PROTOCOL } =
  import.meta.env;
const API_URL = `${VITE_BACKEND_PROTOCOL}://${VITE_BACKEND_HOSTNAME}:${VITE_BACKEND_PORT}/api`;
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "./services/tokenManager.js";

export const refreshAccessToken = async () => {
  // Try to get a new access token on refresh page and session expire
  try {
    const response = await fetch(API_URL + "/auth/sessions/token", {
      // backend endpoint for refreshing access tokens
      method: "POST",
      credentials: "include", // include refresh token cookie in the request, without this, browser don't send httpOnly cookie
    });

    const data = await response.json(); // gets the data in json response
    setAccessToken(data.accessToken); // Store the new access token in memory, so api calls can use it
    return data; // returns access token and user
  } catch {
    return null; // to indicate refresh was not successful. cookie expires, session revoked, server down...
  }
};

export async function apiFetch(endpoint, options = {}) {
  const buildHeader = () => {
    const headers = {
      ...(options?.headers || {}),
      "Content-Type": "application/json",
    };
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  };

  const authFetch = async () =>
    // helper function so we don't write the same thing two times
    await fetch(API_URL + endpoint, {
      ...options, // whatever the method and body is
      headers: buildHeader(), // builds the header with content type and the token
      credentials: "include",
    });

  let response = await authFetch(); // first attempt to fetch endpoint and build header

  if (response.status === 401) {
    // is access token is expired
    const refresh = await refreshAccessToken(); // try to get a new access token
    if (!refresh) {
      clearAccessToken(); // refresh failed, and the user needs to login again.
      window.dispatchEvent(new CustomEvent("auth-expired")); // custom event to navigate user to login page in authProvider
      throw new Error("Session expires. Please login again"); // error msg
    }
    response = await authFetch(); // if refresh was successful, second try to fetch endpoint
  }

  const result = await response.json(); // we have a successful response, and gets it as a json response

  if (!response.ok) {
    const validationMsg = result?.errors?.[0]?.msg;
    throw new Error(
      validationMsg ||
        result?.msg ||
        result?.message ||
        result?.error ||
        "An error occurred while fetching data",
    );
  }

  return result;
}

export async function fetchWithoutAccesstoken(endpoint, options = {}) {
  const headers = {
    ...(options?.headers || {}),
    "Content-type": "application/json",
  }; // Sets headers
  const response = await fetch(API_URL + endpoint, {
    ...options,
    headers,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.msg ||
        result?.message ||
        result?.errors?.[0]?.msg ||
        "An error occurred while fetching data",
    );
  }
  return result;
}
