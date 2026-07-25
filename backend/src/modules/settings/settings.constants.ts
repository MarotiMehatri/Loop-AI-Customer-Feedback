export const SETTINGS_MAX_TIMEZONE_LENGTH = 100;
export const SETTINGS_MAX_LOCALE_LENGTH = 20;
export const SETTINGS_MAX_MODEL_LENGTH = 100;

export const SETTINGS_MIN_SESSION_TIMEOUT = 5;
export const SETTINGS_MAX_SESSION_TIMEOUT = 1_440;

export const SETTINGS_MIN_RETENTION_DAYS = 1;
export const SETTINGS_MAX_RETENTION_DAYS = 3_650;

export const SETTINGS_MAX_EMAIL_DOMAINS = 50;

export const SETTINGS_MESSAGES = {
  retrieved: "Workspace settings retrieved successfully",

  sectionRetrieved: "Settings section retrieved successfully",

  updated: "Workspace settings updated successfully",

  reset: "Settings section reset successfully",

  authenticationRequired: "Authentication is required",

  workspaceRequired: "Workspace is required",

  adminRequired: "Only workspace administrators can manage settings",

  invalidSection: "Invalid settings section",

  workspaceNotFound: "Workspace not found",
} as const;
