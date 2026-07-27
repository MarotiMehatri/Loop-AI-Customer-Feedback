import path from "node:path";

import type { Request, Response } from "express";

import { ApiError } from "../../utils/apiError.js";

import {
  createExport,
  getExport,
  getExportDownload,
  getExportList,
} from "./exports.service.js";

import type {
  CreateExportInput,
  ExportListFilters,
} from "./exports.types.js";

const getAuthenticatedUser = (request: Request) => {
  if (!request.user) {
    throw new ApiError(401, "Authentication is required");
  }

  return request.user;
};

const getExportId = (request: Request): string => {
  const exportId = request.params.exportId;

  if (typeof exportId !== "string" || exportId.trim().length === 0) {
    throw new ApiError(400, "Export ID is required");
  }

  return exportId.trim();
};

/**
 * POST /api/v1/exports
 */
export const createExportController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const exportJob = await createExport(
    request.body as CreateExportInput,
    user.workspaceId,
    user.userId,
  );

  response.status(201).json({
    success: true,
    message: "Export job created successfully",
    data: {
      export: exportJob,
    },
  });
};

/**
 * GET /api/v1/exports
 */
export const listExportController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const filters = request.query as unknown as ExportListFilters;

  const result = await getExportList(user.workspaceId, filters);

  response.status(200).json({
    success: true,
    message: "Export jobs retrieved successfully",
    data: result,
  });
};

/**
 * GET /api/v1/exports/:exportId
 */
export const getExportController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);
  const exportId = getExportId(request);

  const exportJob = await getExport(exportId, user.workspaceId);

  response.status(200).json({
    success: true,
    message: "Export job retrieved successfully",
    data: {
      export: exportJob,
    },
  });
};

/**
 * GET /api/v1/exports/:exportId/download
 */
export const downloadExportController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);
  const exportId = getExportId(request);

  const download = await getExportDownload(exportId, user.workspaceId);

  response.download(download.filePath, download.fileName);
};
