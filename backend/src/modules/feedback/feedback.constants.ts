// export const FEEDBACK_LIMITS = {
//   MIN_CONTENT_LENGTH: 3,
//   MAX_CONTENT_LENGTH: 2000,
//   MAX_CUSTOMER_NAME_LENGTH: 100,
//   MAX_EMAIL_LENGTH: 255,
//   MAX_CATEGORY_LENGTH: 100,
//   MAX_TAG_LENGTH: 50,
//   MAX_TAGS: 20,
//   DEFAULT_PAGE: 1,
//   DEFAULT_LIMIT: 10,
//   MAX_LIMIT: 100,
// } as const;

// export const FEEDBACK_SORT_FIELDS = [
//   "createdAt",
//   "updatedAt",
//   "customerName",
//   "status",
//   "sentiment",
//   "source",
// ] as const;

// export const FEEDBACK_SORT_ORDERS = ["asc", "desc"] as const;
export const FEEDBACK_MESSAGES = {
  authenticationRequired:
    "Authentication is required.",

  workspaceRequired:
    "Workspace is required.",

  contentRequired:
    "Feedback content is required.",

  sourceRequired:
    "Feedback source is required.",

  created:
    "Feedback created successfully.",

  listed:
    "Feedback loaded successfully.",

  retrieved:
    "Feedback retrieved successfully.",

  updated:
    "Feedback updated successfully.",

  deleted:
    "Feedback deleted successfully.",

  notFound:
    "Feedback not found.",
} as const;