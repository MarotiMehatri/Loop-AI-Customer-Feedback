import type { Role } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

import { THEME_MESSAGES } from "./theme.constants.js";

export function assertCanReadThemes(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST", "VIEWER"];
  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to view themes");
  }
}

export function assertCanManageThemes(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];
  if (!allowed.includes(role)) {
    throw new ApiError(403, THEME_MESSAGES.manageForbidden);
  }
}

export function assertCanDeleteThemes(role: Role): void {
  if (role !== "ADMIN") {
    throw new ApiError(403, THEME_MESSAGES.deleteForbidden);
  }
}
