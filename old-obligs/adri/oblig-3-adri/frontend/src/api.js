const VITE_API_HOSTNAME = import.meta.env.VITE_API_HOSTNAME;
const VITE_API_PORT = import.meta.env.VITE_API_PORT;
const VITE_API_PROTOCOL = import.meta.env.VITE_API_PROTOCOL;
// const VITE_API_VERSION = import.meta.env.VITE_API_VERSION;

const API_URL = `${VITE_API_PROTOCOL}://${VITE_API_HOSTNAME}:${VITE_API_PORT}/api`;

export async function apiFetch(endpoint, options) {
    const headers = { ...(options?.headers || {}), "Content-Type": "application/json" }; //safety for spreading headers in case they dont exist
    const response = await fetch(API_URL + endpoint, {
        method: options.method,
        headers: headers,
        body: options.body
    });

    const result = await response.json();

    if (!response.ok) {
        if (result && result.message) {
            throw new Error(result.message);
        } else {
            throw new Error("Error occurred while fetching data");
        }
    }
    return result;
}

//approach from course material (repo: aliaksem/idg2100-26-lib.app.frontend)