import type { Request, Response } from "express";

import { ApiError } from "../../utils/apiError.js";

import { WORKSPACE_MESSAGES } from "./workspace.constants.js";

import { workspaceService } from "./workspace.service.js";

import type {
  CreateWorkspaceInput,
  DeleteWorkspaceInput,
  UpdateWorkspaceInput,
  WorkspaceContext,
} from "./workspace.types.js";

function getContext(request: Request): WorkspaceContext {
  const userId = request.user?.userId;
  const email = request.user?.email;
  const workspaceId = request.workspaceId ?? request.user?.workspaceId;
  const role = request.user?.role;

  if (!userId || !email || !role) {
    throw new ApiError(401, WORKSPACE_MESSAGES.authenticationRequired);
  }

  if (!workspaceId) {
    throw new ApiError(400, WORKSPACE_MESSAGES.workspaceRequired);
  }

  return { userId, email, workspaceId, role };
}

export const getWorkspaceController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const result = await workspaceService.get(getContext(request));

  response.status(200).json({
    success: true,
    message: WORKSPACE_MESSAGES.retrieved,
    data: result,
  });
};

export const getFullWorkspaceController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const result = await workspaceService.getFull(getContext(request));

  response.status(200).json({
    success: true,
    message: WORKSPACE_MESSAGES.fullRetrieved,
    data: result,
  });
};

export const workspaceSummaryController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const result = await workspaceService.getSummary(getContext(request));

  response.status(200).json({
    success: true,
    message: WORKSPACE_MESSAGES.summaryRetrieved,
    data: result,
  });
};

export const workspaceOverviewController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const result = await workspaceService.getOverview(getContext(request));

  response.status(200).json({
    success: true,
    message: WORKSPACE_MESSAGES.overviewRetrieved,
    data: result,
  });
};

export const workspaceHealthController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const result = await workspaceService.getHealth(getContext(request));

  response.status(200).json({
    success: true,
    message: WORKSPACE_MESSAGES.healthRetrieved,
    data: result,
  });
};

export const workspaceUsageController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const period = (request.query.period as "daily" | "weekly" | "monthly") ?? "monthly";

  const result = await workspaceService.getUsage(
    getContext(request),
    period,
  );

  response.status(200).json({
    success: true,
    message: WORKSPACE_MESSAGES.usageRetrieved,
    data: result,
  });
};

export const availableWorkspacesController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const result = await workspaceService.getAvailableWorkspaces(
    getContext(request),
  );

  response.status(200).json({
    success: true,
    message: WORKSPACE_MESSAGES.retrieved,
    data: result,
  });
};

export const switchWorkspaceController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const result = await workspaceService.switchWorkspace(
    getContext(request),
    (request.body as { workspaceId: string }).workspaceId,
  );

  response.status(200).json({
    success: true,
    message: WORKSPACE_MESSAGES.switchSuccess,
    data: result,
  });
};

export const createWorkspaceController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const result = await workspaceService.create(
    getContext(request),
    request.body as CreateWorkspaceInput,
  );

  response.status(201).json({
    success: true,
    message: WORKSPACE_MESSAGES.created,
    data: result,
  });
};

export const updateWorkspaceController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const result = await workspaceService.update(
    getContext(request),
    request.body as UpdateWorkspaceInput,
  );

  response.status(200).json({
    success: true,
    message: WORKSPACE_MESSAGES.updated,
    data: result,
  });
};

export const deleteWorkspaceController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  await workspaceService.remove(
    getContext(request),
    request.body as DeleteWorkspaceInput,
  );

  response.status(200).json({
    success: true,
    message: WORKSPACE_MESSAGES.deleted,
  });
};
