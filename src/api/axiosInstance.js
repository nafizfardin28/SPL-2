import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { getAuthState } from "../store/authstore";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = getAuthState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;