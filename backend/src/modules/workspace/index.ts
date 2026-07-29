export { default as workspaceRouter } from "./workspace.routes.js";

export {
  availableWorkspacesController,
  createWorkspaceController,
  deleteWorkspaceController,
  getFullWorkspaceController,
  getWorkspaceController,
  switchWorkspaceController,
  updateWorkspaceController,
  workspaceHealthController,
  workspaceOverviewController,
  workspaceSummaryController,
  workspaceUsageController,
} from "./workspace.controller.js";

export { workspaceService } from "./workspace.service.js";
export { workspaceRepository } from "./workspace.repository.js";
export { workspaceOverviewService } from "./workspace-overview.service.js";
export { workspaceHealthService } from "./workspace-health.service.js";
export { workspaceUsageService } from "./workspace-usage.service.js";
export { workspaceSwitchService } from "./workspace-switch.service.js";

export {
  createWorkspaceSchema,
  deleteWorkspaceSchema,
  switchWorkspaceSchema,
  updateWorkspaceSchema,
  usageQuerySchema,
  workspaceIdParamSchema,
} from "./workspace.validator.js";

export { mapWorkspace, mapWorkspaceFull } from "./workspace.mapper.js";

export {
  WORKSPACE_MIN_NAME_LENGTH,
  WORKSPACE_MAX_NAME_LENGTH,
  WORKSPACE_DELETE_CONFIRMATION,
  WORKSPACE_OVERVIEW_DAYS,
  WORKSPACE_ACTIVITY_LIMIT,
  WORKSPACE_TOP_THEMES_LIMIT,
  WORKSPACE_MESSAGES,
} from "./workspace.constants.js";

export {
  assertCanDeleteWorkspace,
  assertCanManageWorkspace,
  assertCanReadWorkspace,
} from "./workspace.permissions.js";

export {
  buildFeedbackTrendWhere,
  buildWorkspaceActivitySelect,
  buildWorkspaceSelect,
} from "./workspace.query.js";

export type {
  AvailableWorkspace,
  ComponentHealth,
  CreateWorkspaceInput,
  DeleteWorkspaceInput,
  DepartmentCount,
  FeedbackTrend,
  HealthStatus,
  RecentActivityItem,
  SwitchWorkspaceResult,
  TopTheme,
  UpdateWorkspaceInput,
  UsageStats,
  WorkspaceContext,
  WorkspaceFullResponse,
  WorkspaceOverview,
  WorkspaceResponse,
  WorkspaceSettingsResponse,
  WorkspaceSummary,
} from "./workspace.types.js";
