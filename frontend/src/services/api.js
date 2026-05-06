import axios from "axios";

const envApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_URL =
  envApiUrl && envApiUrl.length > 0
    ? envApiUrl.replace(/\/+$/, "")
    : "/api";

const getStoredUser = () => {
  try {
    const value = localStorage.getItem("expenseUser");
    return value ? JSON.parse(value) : null;
  } catch {
    localStorage.removeItem("expenseUser");
    return null;
  }
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const user = getStoredUser();

  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("expenseUser");
    }
    return Promise.reject(error);
  },
);

export default api;
