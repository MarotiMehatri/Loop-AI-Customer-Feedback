"use client";

import axios from "axios";

import { env } from "../../config/env";

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      window.localStorage.getItem(env.auth.tokenKey) ??
      window.sessionStorage.getItem(env.auth.tokenKey);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem(env.auth.tokenKey);
      window.localStorage.removeItem(env.auth.userKey);
      window.localStorage.removeItem(env.auth.refreshTokenKey);
      window.sessionStorage.removeItem(env.auth.tokenKey);
      window.sessionStorage.removeItem(env.auth.userKey);
      window.sessionStorage.removeItem(env.auth.refreshTokenKey);
    }

    return Promise.reject(error);
  },
);
