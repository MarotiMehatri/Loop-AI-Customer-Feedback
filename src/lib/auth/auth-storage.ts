import type { LoginResponse } from "../../types/auth.types";
import { env } from "../../config/env";

function clearKey(key: string): void {
  window.localStorage.removeItem(key);
  window.sessionStorage.removeItem(key);
}

export function saveAuthSession(
  response: LoginResponse,
  rememberMe: boolean,
): void {
  if (typeof window === "undefined") return;

  clearKey(env.auth.tokenKey);
  clearKey(env.auth.userKey);
  clearKey(env.auth.refreshTokenKey);

  const storage = rememberMe
    ? window.localStorage
    : window.sessionStorage;

  storage.setItem(env.auth.tokenKey, response.accessToken);
  storage.setItem(env.auth.userKey, JSON.stringify(response.user));

  if (response.refreshToken) {
    storage.setItem(env.auth.refreshTokenKey, response.refreshToken);
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  return (
    window.localStorage.getItem(env.auth.tokenKey) ??
    window.sessionStorage.getItem(env.auth.tokenKey)
  );
}

export function getStoredUser<T>(): T | null {
  if (typeof window === "undefined") return null;

  const raw =
    window.localStorage.getItem(env.auth.userKey) ??
    window.sessionStorage.getItem(env.auth.userKey);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;

  clearKey(env.auth.tokenKey);
  clearKey(env.auth.userKey);
  clearKey(env.auth.refreshTokenKey);
}
