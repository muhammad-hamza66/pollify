import axios from "axios";

// Centralized Axios instance. Every API module funnels through this so
// auth headers, error shape, and base URL live in exactly one place.
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

const TOKEN_KEY = "pollify_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// Attach the bearer token the backend's `protect` middleware expects.
client.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize backend errors -- every controller in this codebase responds
// with { message } on failure, so we surface that consistently and let
// callers `catch (e) { e.message }` without re-parsing axios errors everywhere.
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => (onUnauthorized = fn);

client.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      (error.code === "ERR_NETWORK"
        ? "Can't reach the Pollify server. Is the backend running?"
        : "Something went wrong. Please try again.");

    if (status === 401 && onUnauthorized) onUnauthorized();

    return Promise.reject(Object.assign(new Error(message), { status, raw: error }));
  }
);

export default client;
