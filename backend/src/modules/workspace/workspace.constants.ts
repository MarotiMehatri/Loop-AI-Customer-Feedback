export const WORKSPACE_MIN_NAME_LENGTH = 2;
export const WORKSPACE_MAX_NAME_LENGTH = 100;
export const WORKSPACE_DELETE_CONFIRMATION = "DELETE WORKSPACE";

export const WORKSPACE_MESSAGES = {
  retrieved: "Workspace retrieved successfully",
  summaryRetrieved: "Workspace summary retrieved successfully",
  updated: "Workspace updated successfully",
  deleted: "Workspace deleted successfully",
  notFound: "Workspace not found",
  authenticationRequired: "Authentication is required",
  workspaceRequired: "Workspace is required",
  adminRequired: "Only workspace administrators can perform this action",
  invalidDeleteConfirmation: `Enter "${WORKSPACE_DELETE_CONFIRMATION}" to delete the workspace`,
} as const;
