import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function register({ email, password }) {
  const response = await api.post("/api/auth/register", {
    email,
    password,
  });

  return response.data;
}

export async function login({ email, password }) {
  const response = await api.post("/api/auth/login", {
    email,
    password,
  });
  return response.data;
}

export async function profile() {
  const response = await api.get("/api/auth/profile");

  return response.data;
}

export async function logout() {
  const response = await api.get("api/auth/logout");

  return response.data;
}

export async function getAllUsers() {
  const response = await api.get("/api/auth/all");

  return response.data;
}
