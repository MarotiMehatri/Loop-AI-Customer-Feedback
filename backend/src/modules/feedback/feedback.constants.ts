export const FEEDBACK_LIMITS = {
  MIN_CONTENT_LENGTH: 3,
  MAX_CONTENT_LENGTH: 2000,
  MAX_CUSTOMER_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  MAX_CATEGORY_LENGTH: 100,
  MAX_TAG_LENGTH: 50,
  MAX_TAGS: 20,
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const FEEDBACK_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "customerName",
  "status",
  "sentiment",
  "source",
] as const;

export const FEEDBACK_SORT_ORDERS = ["asc", "desc"] as const;
