const { VITE_BACKEND_PORT, VITE_BACKEND_HOSTNAME, VITE_BACKEND_PROTOCOL } =
  import.meta.env;
const API_URL = `${VITE_BACKEND_PROTOCOL}://${VITE_BACKEND_HOSTNAME}:${VITE_BACKEND_PORT}/api`;

// This block of code is taken from lecture live coding idg2100-26-lib.app.frontend
// reusable helper function to reduce writing the same fetch code all over the place.
export async function apiFetch(endpoint, options = {}) {
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
