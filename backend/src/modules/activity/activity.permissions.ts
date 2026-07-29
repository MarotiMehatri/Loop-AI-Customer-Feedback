import type { Role } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

export function assertCanReadActivities(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST", "VIEWER"];
  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to view activity logs");
  }
}

export function assertCanDeleteActivity(role: Role): void {
  const allowed: Role[] = ["ADMIN"];
  if (!allowed.includes(role)) {
    throw new ApiError(403, "Only administrators can delete activity records");
  }
}

export function assertCanClearActivities(role: Role): void {
  const allowed: Role[] = ["ADMIN"];
  if (!allowed.includes(role)) {
    throw new ApiError(403, "Only administrators can clear activity logs");
  }
}
