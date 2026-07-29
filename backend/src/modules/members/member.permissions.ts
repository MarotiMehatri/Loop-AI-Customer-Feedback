import type { Role } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

export function assertCanManageMembers(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];
  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to manage team members");
  }
}

export function assertCanViewMembers(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST", "VIEWER"];
  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to view team members");
  }
}
