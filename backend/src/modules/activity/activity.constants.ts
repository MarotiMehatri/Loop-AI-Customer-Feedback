export const ACTIVITY_DEFAULT_PAGE = 1;
export const ACTIVITY_DEFAULT_LIMIT = 10;
export const ACTIVITY_DEFAULT_RECENT_LIMIT = 8;

export const ACTIVITY_MAX_LIMIT = 100;
export const ACTIVITY_MAX_RECENT_LIMIT = 50;

export const ACTIVITY_MAX_TITLE_LENGTH = 160;
export const ACTIVITY_MAX_DESCRIPTION_LENGTH = 1000;
export const ACTIVITY_MAX_SEARCH_LENGTH = 200;

export const ACTIVITY_RETENTION_DAYS = 90;

export const ACTIVITY_MESSAGES = {
  listed:
    "Activity records retrieved successfully",

  recentRetrieved:
    "Recent activity retrieved successfully",

  summaryRetrieved:
    "Activity summary retrieved successfully",

  retrieved:
    "Activity record retrieved successfully",

  deleted:
    "Activity record deleted successfully",

  cleared:
    "Activity records cleared successfully",

  notFound:
    "Activity record not found",

  authenticationRequired:
    "Authentication is required",

  workspaceRequired:
    "Workspace is required",

  forbidden:
    "You do not have permission to perform this action",
} as const;