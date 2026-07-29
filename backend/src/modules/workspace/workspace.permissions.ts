import type { Role } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

export function assertCanReadWorkspace(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST", "VIEWER"];
  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to view workspace");
  }
}

export function assertCanManageWorkspace(role: Role): void {
  const allowed: Role[] = ["ADMIN"];
  if (!allowed.includes(role)) {
    throw new ApiError(
      403,
      "Only administrators can manage workspace settings",
    );
  }
}

export function assertCanDeleteWorkspace(role: Role): void {
  if (role !== "ADMIN") {
    throw new ApiError(
      403,
      "Only administrators can delete the workspace",
    );
  }
}
