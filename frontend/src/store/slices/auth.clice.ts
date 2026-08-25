"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { login as loginRequest } from "../../Features/Auth/api/auth.api";
import type { AuthUser } from "../../Features/Auth/auth.types";
import { env } from "../../config/env";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<AuthUser>;
  updateUser: (user: AuthUser) => void;
  logout: () => void;
}

function syncAuthStorage(
  token: string | null,
  user: AuthUser | null,
): void {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem(
      env.auth.tokenKey,
      token,
    );

    if (user) {
      window.localStorage.setItem(
        env.auth.userKey,
        JSON.stringify(user),
      );
    } else {
      window.localStorage.removeItem(
        env.auth.userKey,
      );
    }

    return;
  }

  window.localStorage.removeItem(
    env.auth.tokenKey,
  );

  window.localStorage.removeItem(
    env.auth.userKey,
  );
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const result = await loginRequest({
          email,
          password,
        });

        syncAuthStorage(
          result.accessToken,
          result.user,
        );

        set({
          token: result.accessToken,
          user: result.user,
          isAuthenticated: true,
        });

        return result.user;
      },

      updateUser: (user) => {
        const token =
          useAuthStore.getState().token;

        syncAuthStorage(token, user);

        set({
          user,
          isAuthenticated: Boolean(token),
        });
      },

      logout: () => {
        syncAuthStorage(null, null);

        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },
    }),

    {
      name: "loop-auth",

      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),

      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          syncAuthStorage(
            state.token,
            state.user,
          );
        } else {
          syncAuthStorage(null, null);
        }
      },
    },
  ),
);