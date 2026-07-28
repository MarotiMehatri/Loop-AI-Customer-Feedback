import type { Role } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

export function assertCanViewTrends(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST", "VIEWER"];

  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to view trends");
  }
}

export function assertCanDetectTrends(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];

  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to detect trends");
  }
}

export function assertCanGenerateInsights(role: Role): void {
  if (role !== "ADMIN") {
    throw new ApiError(403, "Only administrators can generate trend insights");
  }
}

export function assertCanManageTrendSettings(role: Role): void {
  if (role !== "ADMIN") {
    throw new ApiError(403, "Only administrators can manage trend settings");
  }
}
