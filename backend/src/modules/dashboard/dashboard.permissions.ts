import { Role } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

import { DASHBOARD_MESSAGES } from "./dashboard.constants.js";

export function assertAdminDashboardAccess(role: Role): void {
  if (role !== Role.ADMIN) {
    throw new ApiError(403, DASHBOARD_MESSAGES.adminRequired);
  }
}
