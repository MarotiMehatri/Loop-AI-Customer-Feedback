import type { Role } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

export function assertCanReadExports(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST", "VIEWER"];
  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to view exports");
  }
}

export function assertCanCreateExports(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];
  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to create exports");
  }
}

export function assertCanDeleteExports(role: Role): void {
  if (role !== "ADMIN") {
    throw new ApiError(403, "Only administrators can delete exports");
  }
}
