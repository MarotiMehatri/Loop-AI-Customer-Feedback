"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { login as loginRequest } from "../../Features/Auth/api/auth.api";
import type { AuthUser } from "../../Features/Auth/auth.types";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const result = await loginRequest({ email, password });
        set({
          token: result.accessToken,
          user: result.user,
          isAuthenticated: true,
        });
      },

      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "loop-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
