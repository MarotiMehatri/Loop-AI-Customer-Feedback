export const WORKSPACE_MIN_NAME_LENGTH = 2;
export const WORKSPACE_MAX_NAME_LENGTH = 100;
export const WORKSPACE_DELETE_CONFIRMATION = "DELETE WORKSPACE";

export const WORKSPACE_OVERVIEW_DAYS = 30;
export const WORKSPACE_ACTIVITY_LIMIT = 10;
export const WORKSPACE_TOP_THEMES_LIMIT = 5;

export const WORKSPACE_MESSAGES = {
  retrieved: "Workspace retrieved successfully",
  fullRetrieved: "Workspace details retrieved successfully",
  summaryRetrieved: "Workspace summary retrieved successfully",
  overviewRetrieved: "Workspace overview retrieved successfully",
  updated: "Workspace updated successfully",
  created: "Workspace created successfully",
  deleted: "Workspace deleted successfully",
  notFound: "Workspace not found",
  authenticationRequired: "Authentication is required",
  workspaceRequired: "Workspace is required",
  adminRequired: "Only workspace administrators can perform this action",
  invalidDeleteConfirmation: `Enter "${WORKSPACE_DELETE_CONFIRMATION}" to delete the workspace`,
  healthRetrieved: "Workspace health status retrieved successfully",
  usageRetrieved: "Workspace usage stats retrieved successfully",
  switchSuccess: "Workspace switched successfully",
  noOtherWorkspaces: "No other workspaces available",
  settingsUpdated: "Workspace settings updated successfully",
} as const;
