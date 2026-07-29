import type { Role } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

export function assertCanReadSettings(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST", "VIEWER"];
  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to view workspace settings");
  }
}

export function assertCanUpdateSettings(role: Role): void {
  const allowed: Role[] = ["ADMIN"];
  if (!allowed.includes(role)) {
    throw new ApiError(403, "Only administrators can update workspace settings");
  }
}

export function assertCanResetSettings(role: Role): void {
  const allowed: Role[] = ["ADMIN"];
  if (!allowed.includes(role)) {
    throw new ApiError(403, "Only administrators can reset workspace settings");
  }
}
