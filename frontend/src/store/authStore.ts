"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* =========================================================
AUTH TYPES
========================================================= */

export type UserRole = "ADMIN" | "ANALYST" | "VIEWER";

export type AuthUser = {
id: string;

// Basic information
name: string;
email: string;

// Role
role: UserRole;

// Optional profile information
firstName?: string;
lastName?: string;
phone?: string;
jobTitle?: string;
department?: string;
location?: string;
timezone?: string;
bio?: string;

// Workspace
workspaceId?: string;
workspaceName?: string;

// Account information
createdAt?: string;
updatedAt?: string;
lastLoginAt?: string;

// Security
isEmailVerified?: boolean;
isTwoFactorEnabled?: boolean;
};

/* =========================================================
AUTH STATE
========================================================= */

type AuthState = {
user: AuthUser | null;
token: string | null;

isAuthenticated: boolean;
isLoading: boolean;

// Authentication
login: (user: AuthUser, token: string) => void;
logout: () => void;

// User
setUser: (user: AuthUser | null) => void;
updateUser: (updates: Partial<AuthUser>) => void;

// Token
setToken: (token: string | null) => void;

// Loading
setLoading: (loading: boolean) => void;

// Permissions
hasRole: (role: UserRole | UserRole[]) => boolean;
};

/* =========================================================
USER NORMALIZER
========================================================= */

const normalizeUser = (user: AuthUser): AuthUser => {
const firstName =
user.firstName?.trim() ||
user.name?.trim().split(" ")[0] ||
"";

const lastName =
user.lastName?.trim() ||
user.name?.trim().split(" ").slice(1).join(" ") ||
"";

const fullName =
user.name?.trim() ||
[firstName, lastName].filter(Boolean).join(" ") ||
user.email?.split("@")[0] ||
"User";

return {
...user,
id: user.id,
name: fullName,
email: user.email?.trim() || "",
role: user.role,
firstName,
lastName,
};
};

/* =========================================================
AUTH STORE
========================================================= */

export const useAuthStore = create<AuthState>()(
persist(
(set, get) => ({
/* -----------------------------------------------------
INITIAL STATE
----------------------------------------------------- */
  user: null,
  token: null,

  isAuthenticated: false,
  isLoading: false,

  /* -----------------------------------------------------
     LOGIN
  ----------------------------------------------------- */

  login: (user, token) => {
    const normalizedUser = normalizeUser(user);

    set({
      user: normalizedUser,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  /* -----------------------------------------------------
     LOGOUT
  ----------------------------------------------------- */

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  /* -----------------------------------------------------
     SET USER
  ----------------------------------------------------- */

  setUser: (user) => {
    if (!user) {
      set({
        user: null,
        isAuthenticated: false,
      });

      return;
    }

    const normalizedUser = normalizeUser(user);

    set({
      user: normalizedUser,
      isAuthenticated: true,
    });
  },

  /* -----------------------------------------------------
     UPDATE USER
  ----------------------------------------------------- */

  updateUser: (updates) => {
    const currentUser = get().user;

    if (!currentUser) {
      return;
    }

    const updatedUser = normalizeUser({
      ...currentUser,
      ...updates,
    });

    set({
      user: updatedUser,
    });
  },

  /* -----------------------------------------------------
     SET TOKEN
  ----------------------------------------------------- */

  setToken: (token) => {
    set({
      token,
      isAuthenticated: Boolean(token && get().user),
    });
  },

  /* -----------------------------------------------------
     LOADING
  ----------------------------------------------------- */

  setLoading: (loading) => {
    set({
      isLoading: loading,
    });
  },

  /* -----------------------------------------------------
     ROLE CHECK
  ----------------------------------------------------- */

  hasRole: (role) => {
    const currentUser = get().user;

    if (!currentUser) {
      return false;
    }

    if (Array.isArray(role)) {
      return role.includes(currentUser.role);
    }

    return currentUser.role === role;
  },
}),

/* =======================================================
   PERSIST CONFIGURATION
======================================================= */

{
  name: "loop-auth-storage",

  storage: createJSONStorage(() => localStorage),

  partialize: (state) => ({
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
  }),
},


),
);

/* =========================================================
HELPER FUNCTIONS
========================================================= */

/**

* Get the current logged-in user.
  */
  export const getCurrentUser = (): AuthUser | null => {
  return useAuthStore.getState().user;
  };

/**

* Get the current authentication token.
  */
  export const getAuthToken = (): string | null => {
  return useAuthStore.getState().token;
  };

/**

* Check whether the user is authenticated.
  */
  export const isUserAuthenticated = (): boolean => {
  return useAuthStore.getState().isAuthenticated;
  };

/**

* Check whether the current user has a specific role.
  */
  export const userHasRole = (
  role: UserRole | UserRole[],
  ): boolean => {
  return useAuthStore.getState().hasRole(role);
  };

/**

* Get user initials for avatar display.
  */
  export const getUserInitials = (
  user: AuthUser | null,
  ): string => {
  if (!user) {
  return "U";
  }

const first =
user.firstName?.trim().charAt(0) ||
user.name?.trim().charAt(0) ||
"";

const last =
user.lastName?.trim().charAt(0) ||
user.name?.trim().split(" ")[1]?.charAt(0) ||
"";

const initials = `${first}${last}`.toUpperCase();

return initials || "U";
};

/**

* Clear the complete authentication state.
  */
  export const clearAuth = (): void => {
  useAuthStore.getState().logout();
  };
