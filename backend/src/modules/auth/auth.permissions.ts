// import type { Role } from "../../generated/prisma/client.js";

// const ROLE_HIERARCHY: Record<Role, number> = {
//   ADMIN: 3,
//   ANALYST: 2,
//   VIEWER: 1,
// };

// export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
//   return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
// }

// export function canRegister(): boolean {
//   return true;
// }

// export function canLogin(isActive: boolean): boolean {
//   return isActive;
// }

// export function canAccessProfile(userRole: Role): boolean {
//   return ["ADMIN", "ANALYST", "VIEWER"].includes(userRole);
// }

// export function canManageOwnAccount(
//   requestUserId: string,
//   targetUserId: string,
//   role: Role,
// ): boolean {
//   if (requestUserId === targetUserId) return true;
//   return role === "ADMIN";
// }

// export function canResetPassword(
//   requestUserId: string,
//   targetUserId: string,
//   role: Role,
// ): boolean {
//   if (requestUserId === targetUserId) return true;
//   return role === "ADMIN";
// }

import type { Role } from "../../generated/prisma/client.js";

export const AUTH_ROLES = {
  ADMIN: "ADMIN",
  ANALYST: "ANALYST",
  VIEWER: "VIEWER",
} as const;

export const canRegisterAsRole = (role: Role): boolean => {
  return (
    role === AUTH_ROLES.ADMIN ||
    role === AUTH_ROLES.ANALYST ||
    role === AUTH_ROLES.VIEWER
  );
};

export const isAdmin = (role: Role): boolean => {
  return role === AUTH_ROLES.ADMIN;
};

export const isAnalyst = (role: Role): boolean => {
  return role === AUTH_ROLES.ANALYST;
};

export const isViewer = (role: Role): boolean => {
  return role === AUTH_ROLES.VIEWER;
};

export const canAnalyze = (role: Role): boolean => {
  return (
    role === AUTH_ROLES.ADMIN ||
    role === AUTH_ROLES.ANALYST
  );
};

export const canView = (role: Role): boolean => {
  return (
    role === AUTH_ROLES.ADMIN ||
    role === AUTH_ROLES.ANALYST ||
    role === AUTH_ROLES.VIEWER
  );
};