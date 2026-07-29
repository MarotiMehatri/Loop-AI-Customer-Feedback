import type { Request, Response } from "express";

import { ApiError } from "../../utils/apiError.js";

import { ACTIVITY_MESSAGES } from "./activity.constants.js";

import { activityService } from "./activity.service.js";

import type {
  ActivityActorContext,
  ActivityListQuery,
  ActivitySummaryQuery,
  ClearActivityInput,
  RecentActivityQuery,
} from "./activity.types.js";

function getActivityContext(request: Request): ActivityActorContext {
  const userId = request.user?.userId;
  const workspaceId = request.workspaceId ?? request.user?.workspaceId;
  const role = request.user?.role;

  if (!userId || !role) {
    throw new ApiError(401, ACTIVITY_MESSAGES.authenticationRequired);
  }

  if (!workspaceId) {
    throw new ApiError(400, ACTIVITY_MESSAGES.workspaceRequired);
  }

  return { userId, workspaceId, role };
}

export const listController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const actor = getActivityContext(request);

  const result = await activityService.list(
    actor,
    request.query as unknown as ActivityListQuery,
  );

  response.status(200).json({
    success: true,
    message: ACTIVITY_MESSAGES.listed,
    data: result,
  });
};

export const listMineController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const actor = getActivityContext(request);

  const result = await activityService.listMine(
    actor,
    request.query as unknown as ActivityListQuery,
  );

  response.status(200).json({
    success: true,
    message: ACTIVITY_MESSAGES.listed,
    data: result,
  });
};

export const recentController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const actor = getActivityContext(request);

  const result = await activityService.recent(
    actor,
    request.query as unknown as RecentActivityQuery,
  );

  response.status(200).json({
    success: true,
    message: ACTIVITY_MESSAGES.recentRetrieved,
    data: result,
  });
};

export const summaryController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const actor = getActivityContext(request);

  const result = await activityService.getSummary(
    actor,
    request.query as unknown as ActivitySummaryQuery,
  );

  response.status(200).json({
    success: true,
    message: ACTIVITY_MESSAGES.summaryRetrieved,
    data: result,
  });
};

export const getByIdController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const actor = getActivityContext(request);

  const result = await activityService.getById(
    actor,
    request.params.activityId as string,
  );

  response.status(200).json({
    success: true,
    message: ACTIVITY_MESSAGES.retrieved,
    data: result,
  });
};

export const removeController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const actor = getActivityContext(request);

  await activityService.remove(actor, request.params.activityId as string);

  response.status(200).json({
    success: true,
    message: ACTIVITY_MESSAGES.deleted,
  });
};

export const clearController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const actor = getActivityContext(request);

  const result = await activityService.clear(
    actor,
    request.body as ClearActivityInput,
  );

  response.status(200).json({
    success: true,
    message: ACTIVITY_MESSAGES.cleared,
    data: result,
  });
};
