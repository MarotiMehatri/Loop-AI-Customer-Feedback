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
