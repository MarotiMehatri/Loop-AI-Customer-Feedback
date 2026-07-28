import type { Role } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

export function assertCanViewAnalytics(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST", "VIEWER"];

  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to view analytics");
  }
}

export function assertCanExportAnalytics(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];

  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to export analytics data");
  }
}

export function assertCanCreateLiveUrl(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];

  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to create live URLs");
  }
}

export function assertCanViewInsights(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];

  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to view analytics insights");
  }
}

export function assertCanManageAnalyticsSettings(role: Role): void {
  if (role !== "ADMIN") {
    throw new ApiError(403, "Only administrators can manage analytics settings");
  }
}

export function assertCanAccessRealTimeAnalytics(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];

  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to access real-time analytics");
  }
}
