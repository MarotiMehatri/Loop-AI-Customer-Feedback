export const NOTIFICATION_DEFAULT_PAGE = 1;
export const NOTIFICATION_DEFAULT_LIMIT = 20;
export const NOTIFICATION_MAX_LIMIT = 100;

export const NOTIFICATION_MAX_TITLE_LENGTH = 160;
export const NOTIFICATION_MAX_MESSAGE_LENGTH = 2_000;
export const NOTIFICATION_MAX_SEARCH_LENGTH = 200;
export const NOTIFICATION_MAX_ENTITY_TYPE_LENGTH = 100;

export const NOTIFICATION_RETENTION_DAYS = 90;

export const NOTIFICATION_MESSAGES = {
  listed: "Notifications retrieved successfully",

  retrieved: "Notification retrieved successfully",

  unreadCountRetrieved: "Unread notification count retrieved successfully",

  markedAsRead: "Notification marked as read successfully",

  allMarkedAsRead: "All notifications marked as read successfully",

  deleted: "Notification deleted successfully",

  cleared: "Notifications cleared successfully",

  notFound: "Notification not found",

  authenticationRequired: "Authentication is required",

  workspaceRequired: "Workspace is required",
} as const;
