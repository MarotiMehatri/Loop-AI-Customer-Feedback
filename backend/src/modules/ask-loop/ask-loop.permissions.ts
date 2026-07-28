import type { Role } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/apiError.js";

export function assertCanAskQuestion(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST", "VIEWER"];

  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to ask questions");
  }
}

export function assertCanViewConversations(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST", "VIEWER"];

  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to view conversations");
  }
}

export function assertCanDeleteConversation(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];

  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to delete conversations");
  }
}

export function assertCanManageSavedQueries(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];

  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to manage saved queries");
  }
}
