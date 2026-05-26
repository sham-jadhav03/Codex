import axiosInstance from "../config/axios";

export async function register({ email, password }) {
  const response = await axiosInstance.post("/api/auth/register", {
    email,
    password,
  });

  return response.data;
}

export async function login({ email, password }) {
  const response = await axiosInstance.post("/api/auth/login", {
    email,
    password,
  });
  return response.data;
}

export async function profile() {
  const response = await axiosInstance.get("/api/auth/profile");

  return response.data;
}

export async function logout() {
  const response = await axiosInstance.get("/api/auth/logout");

  return response.data;
}

export async function getAllUsers() {
  const response = await axiosInstance.get("/api/auth/all");

  return response.data;
}
