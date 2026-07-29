import { ActivityType } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

import { activityLogger } from "../activity/activity.logger.js";

import { assertPermission } from "../../permissions/rolePermissions.js";

import { PERMISSION } from "../../permissions/permission.types.js";

import {
  WORKSPACE_DELETE_CONFIRMATION,
  WORKSPACE_MESSAGES,
} from "./workspace.constants.js";

import { mapWorkspace, mapWorkspaceFull } from "./workspace.mapper.js";

import { workspaceOverviewService } from "./workspace-overview.service.js";

import { workspaceHealthService } from "./workspace-health.service.js";

import { workspaceUsageService } from "./workspace-usage.service.js";

import { workspaceSwitchService } from "./workspace-switch.service.js";

import { workspaceRepository } from "./workspace.repository.js";

import type {
  AvailableWorkspace,
  CreateWorkspaceInput,
  DeleteWorkspaceInput,
  HealthStatus,
  SwitchWorkspaceResult,
  UpdateWorkspaceInput,
  UsageStats,
  WorkspaceContext,
  WorkspaceOverview,
  WorkspaceResponse,
  WorkspaceSummary,
} from "./workspace.types.js";

function normalizeName(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export const workspaceService = {
  async get(context: WorkspaceContext): Promise<WorkspaceResponse> {
    assertPermission(
      context.role,
      PERMISSION.WORKSPACE_READ,
      "You do not have permission to view this workspace",
    );

    const workspace = await workspaceRepository.findById(context.workspaceId);
    if (!workspace) throw new ApiError(404, WORKSPACE_MESSAGES.notFound);

    return mapWorkspace(workspace);
  },

  async getFull(context: WorkspaceContext) {
    assertPermission(
      context.role,
      PERMISSION.WORKSPACE_READ,
      "You do not have permission to view this workspace",
    );

    const workspace = await workspaceRepository.findFullById(
      context.workspaceId,
    );
    if (!workspace) throw new ApiError(404, WORKSPACE_MESSAGES.notFound);

    return mapWorkspaceFull(workspace);
  },

  async getSummary(context: WorkspaceContext): Promise<WorkspaceSummary> {
    assertPermission(
      context.role,
      PERMISSION.WORKSPACE_READ,
      "You do not have permission to view this workspace",
    );

    const workspace = await workspaceRepository.findById(context.workspaceId);
    if (!workspace) throw new ApiError(404, WORKSPACE_MESSAGES.notFound);

    return workspaceRepository.getSummary(context.workspaceId);
  },

  async getOverview(context: WorkspaceContext): Promise<WorkspaceOverview> {
    assertPermission(
      context.role,
      PERMISSION.WORKSPACE_READ,
      "You do not have permission to view this workspace",
    );

    const workspace = await workspaceRepository.findById(context.workspaceId);
    if (!workspace) throw new ApiError(404, WORKSPACE_MESSAGES.notFound);

    return workspaceOverviewService.getOverview(context.workspaceId);
  },

  async getHealth(_context: WorkspaceContext): Promise<HealthStatus> {
    return workspaceHealthService.getHealth();
  },

  async getUsage(
    context: WorkspaceContext,
    period?: "daily" | "weekly" | "monthly",
  ): Promise<UsageStats> {
    assertPermission(
      context.role,
      PERMISSION.WORKSPACE_READ,
      "You do not have permission to view this workspace",
    );

    return workspaceUsageService.getUsage(context.workspaceId, period);
  },

  async getAvailableWorkspaces(
    context: WorkspaceContext,
  ): Promise<AvailableWorkspace[]> {
    return workspaceSwitchService.getAvailableWorkspaces(
      context.email,
      context.workspaceId,
    );
  },

  async switchWorkspace(
    context: WorkspaceContext,
    targetWorkspaceId: string,
  ): Promise<SwitchWorkspaceResult> {
    return workspaceSwitchService.switchToWorkspace({
      userId: context.userId,
      email: context.email,
      currentRole: context.role,
      targetWorkspaceId,
      currentWorkspaceId: context.workspaceId,
    });
  },

  async create(
    context: WorkspaceContext,
    input: CreateWorkspaceInput,
  ) {
    assertPermission(
      context.role,
      PERMISSION.WORKSPACE_UPDATE,
      "You do not have permission to create workspaces",
    );

    const name = normalizeName(input.name);
    let slug = slugify(name);

    const existing = await workspaceRepository.findBySlug(slug);
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const workspace = await workspaceRepository.create(name, slug);

    await activityLogger.logSafe({
      userId: context.userId,
      workspaceId: context.workspaceId,
      type: ActivityType.WORKSPACE_CREATED,
      title: "Workspace created",
      description: `Workspace "${name}" was created.`,
      entityType: "WORKSPACE",
      entityId: workspace.id,
      metadata: { slug },
    });

    return mapWorkspace(workspace);
  },

  async update(
    context: WorkspaceContext,
    input: UpdateWorkspaceInput,
  ) {
    assertPermission(
      context.role,
      PERMISSION.WORKSPACE_UPDATE,
      "You do not have permission to update this workspace",
    );

    const updated = await workspaceRepository.updateName(
      context.workspaceId,
      normalizeName(input.name),
    );

    if (!updated) throw new ApiError(404, WORKSPACE_MESSAGES.notFound);

    await activityLogger.logSafe({
      userId: context.userId,
      workspaceId: context.workspaceId,
      type: ActivityType.WORKSPACE_UPDATED,
      title: "Workspace updated",
      description: `Workspace "${updated.name}" was updated.`,
      entityType: "WORKSPACE",
      entityId: updated.id,
      metadata: { updatedFields: ["name"] },
    });

    return mapWorkspace(updated);
  },

  async remove(
    context: WorkspaceContext,
    input: DeleteWorkspaceInput,
  ): Promise<void> {
    assertPermission(
      context.role,
      PERMISSION.WORKSPACE_DELETE,
      "Only administrators can delete the workspace",
    );

    if (input.confirmation !== WORKSPACE_DELETE_CONFIRMATION) {
      throw new ApiError(400, WORKSPACE_MESSAGES.invalidDeleteConfirmation);
    }

    const workspace = await workspaceRepository.findById(context.workspaceId);
    if (!workspace) {
      throw new ApiError(404, WORKSPACE_MESSAGES.notFound);
    }

    const result = await workspaceRepository.deleteById(context.workspaceId);
    if (result.count === 0) {
      throw new ApiError(404, WORKSPACE_MESSAGES.notFound);
    }
  },
};
