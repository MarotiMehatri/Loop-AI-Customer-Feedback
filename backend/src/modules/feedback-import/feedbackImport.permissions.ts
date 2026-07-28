import type { Role } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

export function assertCanImportFeedback(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];

  if (!allowed.includes(role)) {
    throw new ApiError(
      403,
      "You do not have permission to import feedback. Only administrators and analysts can perform imports.",
    );
  }
}

export function assertCanViewImportHistory(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST", "VIEWER"];

  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to view import history");
  }
}

export function assertCanDeleteImport(role: Role): void {
  if (role !== "ADMIN") {
    throw new ApiError(403, "Only administrators can delete import records");
  }
}

export function assertCanRetryImport(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];

  if (!allowed.includes(role)) {
    throw new ApiError(
      403,
      "You do not have permission to retry imports. Only administrators and analysts can retry.",
    );
  }
}

export function assertCanExportImportErrors(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];

  if (!allowed.includes(role)) {
    throw new ApiError(
      403,
      "You do not have permission to export import errors",
    );
  }
}
