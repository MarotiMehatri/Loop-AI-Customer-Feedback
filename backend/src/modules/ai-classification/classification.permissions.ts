import type { Role } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

export function assertCanClassify(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];

  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to classify feedback");
  }
}

export function assertCanViewClassifications(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST", "VIEWER"];

  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to view classifications");
  }
}

export function assertCanDeleteClassification(role: Role): void {
  if (role !== "ADMIN") {
    throw new ApiError(403, "Only administrators can delete classifications");
  }
}

export function assertCanManageClassificationSettings(role: Role): void {
  if (role !== "ADMIN") {
    throw new ApiError(403, "Only administrators can manage classification settings");
  }
}
