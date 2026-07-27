import type { Request, Response } from "express";

import { ApiError } from "../../utils/apiError.js";

import {
  createSavedView,
  deleteSavedView,
  getSavedView,
  getSavedViewList,
  updateSavedView,
} from "./savedViews.service.js";

import type {
  CreateSavedViewInput,
  SavedViewListFilters,
  UpdateSavedViewInput,
} from "./savedViews.types.js";

const getAuthenticatedUser = (request: Request) => {
  if (!request.user) {
    throw new ApiError(401, "Authentication is required");
  }

  return request.user;
};

const getViewId = (request: Request): string => {
  const viewId = request.params.viewId;

  if (typeof viewId !== "string" || viewId.trim().length === 0) {
    throw new ApiError(400, "View ID is required");
  }

  return viewId.trim();
};

/**
 * POST /api/v1/saved-views
 */
export const createSavedViewController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const view = await createSavedView(
    request.body as CreateSavedViewInput,
    user.workspaceId,
    user.userId,
  );

  response.status(201).json({
    success: true,
    message: "Saved view created successfully",
    data: {
      view,
    },
  });
};

/**
 * GET /api/v1/saved-views
 */
export const listSavedViewController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const filters = request.query as unknown as SavedViewListFilters;

  const result = await getSavedViewList(user.workspaceId, filters);

  response.status(200).json({
    success: true,
    message: "Saved views retrieved successfully",
    data: result,
  });
};

/**
 * GET /api/v1/saved-views/:viewId
 */
export const getSavedViewController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);
  const viewId = getViewId(request);

  const view = await getSavedView(viewId, user.workspaceId);

  response.status(200).json({
    success: true,
    message: "Saved view retrieved successfully",
    data: {
      view,
    },
  });
};

/**
 * PATCH /api/v1/saved-views/:viewId
 */
export const updateSavedViewController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);
  const viewId = getViewId(request);

  const view = await updateSavedView(
    viewId,
    user.workspaceId,
    request.body as UpdateSavedViewInput,
  );

  response.status(200).json({
    success: true,
    message: "Saved view updated successfully",
    data: {
      view,
    },
  });
};

/**
 * DELETE /api/v1/saved-views/:viewId
 */
export const deleteSavedViewController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);
  const viewId = getViewId(request);

  await deleteSavedView(viewId, user.workspaceId);

  response.status(200).json({
    success: true,
    message: "Saved view deleted successfully",
  });
};
