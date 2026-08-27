import type { Role } from "../Features/Auth/auth.types";

export type Permission =
  | "dashboard:view"
  | "feedback:view"
  | "feedback:create"
  | "analytics:view"
  | "ai:ask"
  | "reports:view"
  | "team:view"
  | "team:manage"
  | "settings:view"
  | "notifications:view";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "dashboard:view",
    "feedback:view",
    "feedback:create",
    "analytics:view",
    "ai:ask",
    "reports:view",
    "team:view",
    "team:manage",
    "settings:view",
    "notifications:view",
  ],

  ANALYST: [
    "dashboard:view",
    "feedback:view",
    "feedback:create",
    "analytics:view",
    "ai:ask",
    "reports:view",
    "settings:view",
    "notifications:view",
  ],

  VIEWER: [
    "dashboard:view",
    "feedback:view",
    "analytics:view",
    "ai:ask",
    "reports:view",
    "notifications:view",
  ],
};

export function hasPermission(
  role: Role | undefined,
  permission: Permission,
): boolean {
  if (!role) {
    return false;
  }

  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  role: Role | undefined,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) =>
    hasPermission(role, permission),
  );
}