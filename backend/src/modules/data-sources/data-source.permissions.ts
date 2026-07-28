import type { Role } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

export function assertCanReadDataSources(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST", "VIEWER"];
  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to view data sources");
  }
}

export function assertCanManageDataSources(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];
  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to manage data sources");
  }
}

export function assertCanDeleteDataSources(role: Role): void {
  if (role !== "ADMIN") {
    throw new ApiError(403, "Only administrators can delete data sources");
  }
}
