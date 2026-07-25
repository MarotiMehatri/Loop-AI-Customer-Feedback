export const THEME_DEFAULT_PAGE = 1;
export const THEME_DEFAULT_LIMIT = 20;
export const THEME_MAX_LIMIT = 100;

export const THEME_DEFAULT_FEEDBACK_LIMIT = 20;
export const THEME_MAX_FEEDBACK_LIMIT = 100;

export const THEME_DEFAULT_GENERATION_LIMIT = 200;
export const THEME_MAX_GENERATION_LIMIT = 500;
export const THEME_DEFAULT_MAX_GENERATED = 8;
export const THEME_MAX_GENERATED = 20;
export const THEME_DEFAULT_MIN_CLUSTER_SIZE = 2;

export const THEME_MAX_NAME_LENGTH = 100;
export const THEME_MAX_DESCRIPTION_LENGTH = 1_000;
export const THEME_MAX_SEARCH_LENGTH = 200;

export const THEME_COLOR_PALETTE = [
  "#7C3AED",
  "#2563EB",
  "#0891B2",
  "#059669",
  "#65A30D",
  "#CA8A04",
  "#EA580C",
  "#DC2626",
  "#DB2777",
  "#9333EA",
] as const;

export const THEME_MESSAGES = {
  created: "Theme created successfully",
  updated: "Theme updated successfully",
  deleted: "Theme deleted successfully",
  listed: "Themes retrieved successfully",
  retrieved: "Theme retrieved successfully",
  summaryRetrieved: "Theme summary retrieved successfully",
  analyticsRetrieved: "Theme analytics retrieved successfully",
  feedbackRetrieved: "Theme feedback retrieved successfully",
  feedbackAssigned: "Feedback assigned to theme successfully",
  feedbackRemoved: "Feedback removed from theme successfully",
  generated: "Theme suggestions generated successfully",

  notFound: "Theme not found",
  feedbackNotFound: "Feedback not found",
  assignmentNotFound: "Feedback is not assigned to this theme",
  duplicateName: "A theme with this name already exists",
  noFeedback: "No feedback is available for theme generation",
  noCandidates: "No new theme candidates were found",

  authenticationRequired: "Authentication is required",
  workspaceRequired: "Workspace is required",
  manageForbidden: "Only administrators and analysts can manage themes",
  deleteForbidden: "Only administrators can delete themes",
} as const;
