// Centralized API fetch — all services go through this
// Based on Adrian's pattern but with auth headers from localStorage

const BASE_URL = "/api";

export async function apiFetch(endpoint, options = {}) {
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  const headers = {
    "Content-Type": "application/json",
    ...(userId && { "x-user-id": userId }),
    ...(role && { "x-user-type": role }),
    ...(options.headers || {}),
  };

  const response = await fetch(BASE_URL + endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Something went wrong");
  }

  return data;
}
