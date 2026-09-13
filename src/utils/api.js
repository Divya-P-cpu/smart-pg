import axios from "axios";

const API_BASE_URL = import.meta.env.DEV ? "" : "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  paramsSerializer: {
    indexes: null,
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getPGs(params = {}) {
  const response = await api.get("/api/pgs", { params });
  return response.data;
}

export { api, API_BASE_URL };