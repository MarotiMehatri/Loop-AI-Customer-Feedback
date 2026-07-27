import type { Request, Response } from "express";

import { ApiError } from "../../utils/apiError.js";

import {
  createDataSource,
  deleteDataSource,
  getDataSource,
  getDataSourceList,
  syncDataSource,
  updateDataSource,
} from "./dataSources.service.js";

import type {
  CreateDataSourceInput,
  DataSourceListFilters,
  UpdateDataSourceInput,
} from "./dataSources.types.js";

const getAuthenticatedUser = (request: Request) => {
  if (!request.user) {
    throw new ApiError(401, "Authentication is required");
  }

  return request.user;
};

const getDataSourceId = (request: Request): string => {
  const dataSourceId = request.params.dataSourceId;

  if (typeof dataSourceId !== "string" || dataSourceId.trim().length === 0) {
    throw new ApiError(400, "Data source ID is required");
  }

  return dataSourceId.trim();
};

/**
 * POST /api/v1/data-sources
 */
export const createDataSourceController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const dataSource = await createDataSource(
    request.body as CreateDataSourceInput,
    user.workspaceId,
    user.userId,
  );

  response.status(201).json({
    success: true,
    message: "Data source created successfully",
    data: {
      dataSource,
    },
  });
};

/**
 * GET /api/v1/data-sources
 */
export const listDataSourceController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const filters = request.query as unknown as DataSourceListFilters;

  const result = await getDataSourceList(user.workspaceId, filters);

  response.status(200).json({
    success: true,
    message: "Data sources retrieved successfully",
    data: result,
  });
};

/**
 * GET /api/v1/data-sources/:dataSourceId
 */
export const getDataSourceController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);
  const dataSourceId = getDataSourceId(request);

  const dataSource = await getDataSource(dataSourceId, user.workspaceId);

  response.status(200).json({
    success: true,
    message: "Data source retrieved successfully",
    data: {
      dataSource,
    },
  });
};

/**
 * PATCH /api/v1/data-sources/:dataSourceId
 */
export const updateDataSourceController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);
  const dataSourceId = getDataSourceId(request);

  const dataSource = await updateDataSource(
    dataSourceId,
    user.workspaceId,
    request.body as UpdateDataSourceInput,
  );

  response.status(200).json({
    success: true,
    message: "Data source updated successfully",
    data: {
      dataSource,
    },
  });
};

/**
 * DELETE /api/v1/data-sources/:dataSourceId
 */
export const deleteDataSourceController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);
  const dataSourceId = getDataSourceId(request);

  await deleteDataSource(dataSourceId, user.workspaceId);

  response.status(200).json({
    success: true,
    message: "Data source deleted successfully",
  });
};

/**
 * POST /api/v1/data-sources/:dataSourceId/sync
 */
export const syncDataSourceController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);
  const dataSourceId = getDataSourceId(request);

  const result = await syncDataSource(dataSourceId, user.workspaceId);

  response.status(200).json({
    success: true,
    message: "Data source sync completed",
    data: {
      sync: result,
    },
  });
};
