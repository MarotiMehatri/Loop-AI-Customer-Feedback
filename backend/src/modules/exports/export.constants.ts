export const EXPORT_LIMITS = {
  MAX_NAME_LENGTH: 100,
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const EXPORT_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "name",
  "status",
] as const;

export const EXPORT_SORT_ORDERS = ["asc", "desc"] as const;

export const EXPORT_FORMATS: readonly string[] = [
  "CSV",
  "XLSX",
  "JSON",
  "PDF",
] as const;

export const EXPORT_STATUSES: readonly string[] = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
] as const;

export const EXPORT_MESSAGES = {
  created: "Export job created successfully",
  listed: "Export jobs retrieved successfully",
  retrieved: "Export job retrieved successfully",
  deleted: "Export job deleted successfully",
  notFound: "Export job was not found",
  notReady: "Export is not ready for download",
  fileNotFound: "Export file no longer exists",
  authenticationRequired: "Authentication is required",
  workspaceRequired: "Workspace is required",
} as const;
