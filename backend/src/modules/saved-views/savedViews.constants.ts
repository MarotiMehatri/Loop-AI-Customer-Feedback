export const SAVED_VIEW_LIMITS = {
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_FILTERS_SIZE: 10000,
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const SAVED_VIEW_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "name",
] as const;

export const SAVED_VIEW_SORT_ORDERS = ["asc", "desc"] as const;
