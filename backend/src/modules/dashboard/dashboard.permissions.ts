import { Role } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

import { DASHBOARD_MESSAGES } from "./dashboard.constants.js";

export function assertDashboardAccess(role: Role): void {
  const allowedRoles: Role[] = [Role.ADMIN, Role.ANALYST, Role.VIEWER];
  if (!allowedRoles.includes(role)) {
    throw new ApiError(403, DASHBOARD_MESSAGES.adminRequired);
  }
}
