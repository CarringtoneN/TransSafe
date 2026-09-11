import axios from "axios";

// REPLACE THIS with your actual deployed BACKEND Vercel URL.
const API_BASE_URL = "https://YOUR-BACKEND-VERCEL-URL.vercel.app/api";

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("transsafe_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;