import type { Role } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/apiError.js";

export function assertCanCreateReport(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];

  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to create reports");
  }
}

export function assertCanViewReports(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST", "VIEWER"];

  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to view reports");
  }
}

export function assertCanUpdateReport(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];

  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to update reports");
  }
}

export function assertCanDeleteReport(role: Role): void {
  if (role !== "ADMIN") {
    throw new ApiError(403, "Only administrators can delete reports");
  }
}

export function assertCanGenerateReport(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];

  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to generate reports");
  }
}

export function assertCanExportReport(role: Role): void {
  const allowed: Role[] = ["ADMIN", "ANALYST"];

  if (!allowed.includes(role)) {
    throw new ApiError(403, "You do not have permission to export reports");
  }
}

export function assertCanScheduleReport(role: Role): void {
  if (role !== "ADMIN") {
    throw new ApiError(403, "Only administrators can schedule reports");
  }
}
