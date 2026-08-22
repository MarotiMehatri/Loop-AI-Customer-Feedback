import type { LoginResponse } from "../../types/auth.types";

const TOKEN_KEY = "loop_access_token";
const USER_KEY = "loop_auth_user";

export function saveAuthSession(
  response: LoginResponse,
  rememberMe: boolean,
): void {
  if (typeof window === "undefined") return;

  const storage = rememberMe ? window.localStorage : window.sessionStorage;

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(USER_KEY);

  storage.setItem(TOKEN_KEY, response.accessToken);
  storage.setItem(USER_KEY, JSON.stringify(response.user));

  if (response.refreshToken) {
    storage.setItem("loop_refresh_token", response.refreshToken);
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  return (
    window.localStorage.getItem(TOKEN_KEY) ??
    window.sessionStorage.getItem(TOKEN_KEY)
  );
}

export function getStoredUser<T>(): T | null {
  if (typeof window === "undefined") return null;

  const raw =
    window.localStorage.getItem(USER_KEY) ??
    window.sessionStorage.getItem(USER_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;

  const keys = [TOKEN_KEY, USER_KEY, "loop_refresh_token"];

  for (const key of keys) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
}
