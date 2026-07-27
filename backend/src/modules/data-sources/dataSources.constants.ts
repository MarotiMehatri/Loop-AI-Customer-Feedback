export const DATA_SOURCE_LIMITS = {
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const DATA_SOURCE_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "name",
  "type",
  "status",
] as const;

export const DATA_SOURCE_SORT_ORDERS = ["asc", "desc"] as const;

export const DATA_SOURCE_TYPES: readonly string[] = [
  "API",
  "WEBHOOK",
  "CSV",
  "DATABASE",
  "EMAIL",
  "SOCIAL_MEDIA",
  "CUSTOM",
] as const;

export const DATA_SOURCE_STATUSES: readonly string[] = [
  "ACTIVE",
  "INACTIVE",
  "ERROR",
  "SYNCING",
] as const;
