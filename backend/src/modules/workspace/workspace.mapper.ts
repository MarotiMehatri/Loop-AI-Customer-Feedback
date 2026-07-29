import type {
  WorkspaceFullResponse,
  WorkspaceResponse,
  WorkspaceSettingsResponse,
} from "./workspace.types.js";

interface WorkspaceRecord {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FullWorkspaceRecord extends WorkspaceRecord {
  _count: {
    users: number;
    feedbacks: number;
  };
  settings: {
    general: unknown;
    ai: unknown;
    feedback: unknown;
    reports: unknown;
    security: unknown;
    retention: unknown;
    notifications: unknown;
  } | null;
}

export function mapWorkspace(
  workspace: WorkspaceRecord,
): WorkspaceResponse {
  return {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
  };
}

export function mapWorkspaceFull(
  workspace: FullWorkspaceRecord,
): WorkspaceFullResponse {
  return {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
    memberCount: workspace._count.users,
    feedbackCount: workspace._count.feedbacks,
    settings: workspace.settings
      ? {
          general: workspace.settings.general as Record<string, unknown>,
          ai: workspace.settings.ai as Record<string, unknown>,
          feedback: workspace.settings.feedback as Record<string, unknown>,
          reports: workspace.settings.reports as Record<string, unknown>,
          security: workspace.settings.security as Record<string, unknown>,
          retention: workspace.settings.retention as Record<string, unknown>,
          notifications: workspace.settings.notifications as Record<string, unknown>,
        }
      : null,
  };
}
