"use client";

import axios from "axios";

import { env } from "../../config/env";

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem(
        env.auth.tokenKey,
      );

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    if (
      error?.response?.status === 401 &&
      typeof window !== "undefined"
    ) {
      window.localStorage.removeItem(
        env.auth.tokenKey,
      );

      window.localStorage.removeItem(
        env.auth.userKey,
      );
    }

    return Promise.reject(error);
  },
);