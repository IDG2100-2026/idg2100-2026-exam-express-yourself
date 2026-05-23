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

  const result = await response.json();

  if (!response.ok) {
    const validationMsg = result?.errors?.[0]?.msg;
    throw new Error(validationMsg || result?.msg || result?.message || result?.error || "An error occurred while fetching data");
  }

  return result;
}
