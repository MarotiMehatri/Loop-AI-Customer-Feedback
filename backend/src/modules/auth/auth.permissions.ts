import type { Role } from "../../generated/prisma/client.js";

const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 3,
  ANALYST: 2,
  VIEWER: 1,
};

export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}

export function canRegister(): boolean {
  return true;
}

export function canLogin(isActive: boolean): boolean {
  return isActive;
}

export function canAccessProfile(userRole: Role): boolean {
  return ["ADMIN", "ANALYST", "VIEWER"].includes(userRole);
}

export function canManageOwnAccount(
  requestUserId: string,
  targetUserId: string,
  role: Role,
): boolean {
  if (requestUserId === targetUserId) return true;
  return role === "ADMIN";
}

export function canResetPassword(
  requestUserId: string,
  targetUserId: string,
  role: Role,
): boolean {
  if (requestUserId === targetUserId) return true;
  return role === "ADMIN";
}
