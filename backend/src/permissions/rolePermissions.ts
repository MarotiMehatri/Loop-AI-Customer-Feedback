import { Role } from "../generated/prisma/client.js";

import { ApiError } from "../utils/apiError.js";

import { ADMIN_PERMISSIONS } from "./admin.permissions.js";

import { ANALYST_PERMISSIONS } from "./analyst.permissions.js";

import { VIEWER_PERMISSIONS } from "./viewer.permissions.js";

import type { Permission } from "./permission.types.js";

const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  [Role.ADMIN]: ADMIN_PERMISSIONS,

  [Role.ANALYST]: ANALYST_PERMISSIONS,

  [Role.VIEWER]: VIEWER_PERMISSIONS,
};

export function hasPermission(
  role: Role | undefined,
  permission: Permission,
): boolean {
  if (!role) {
    return false;
  }

  return ROLE_PERMISSIONS[role].has(permission);
}

export function assertPermission(
  role: Role | undefined,
  permission: Permission,
  message = "You do not have permission to perform this action",
): void {
  if (!hasPermission(role, permission)) {
    throw new ApiError(403, message);
  }
}
