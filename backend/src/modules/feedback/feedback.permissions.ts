import type { Role } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/apiError.js";

export function assertCanReadFeedback(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST", "VIEWER"];
  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to view feedback");
  }
}

export function assertCanCreateFeedback(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];
  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to create feedback");
  }
}

export function assertCanUpdateFeedback(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];
  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to update feedback");
  }
}

export function assertCanDeleteFeedback(role: Role): void {
  if (role !== "ADMIN") {
    throw new ApiError(403, "Only administrators can delete feedback");
  }
}

export function assertCanChangeStatus(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];
  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to change feedback status");
  }
}

export function assertCanMarkImportant(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];
  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to mark feedback as important");
  }
}
