export const NOTIFICATION_DEFAULT_PAGE = 1;

export const NOTIFICATION_DEFAULT_LIMIT = 20;

export const NOTIFICATION_MAX_LIMIT = 100;

export const NOTIFICATION_MESSAGES = {
  NOT_FOUND: "Notification not found.",

  UNAUTHORIZED: "Authentication is required.",

  WORKSPACE_REQUIRED: "Workspace context is required.",

  INVALID_QUERY: "Invalid notification query.",

  INVALID_ID: "Invalid notification ID.",
} as const;
