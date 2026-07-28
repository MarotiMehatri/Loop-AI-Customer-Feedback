import type { Request, RequestHandler } from "express";

import { ApiError } from "../../utils/apiError.js";

import { EXPORT_MESSAGES } from "./export.constants.js";

import { exportService } from "./export.service.js";

import type {
  CreateExportInput,
  ExportActorContext,
  ExportListFilters,
} from "./export.types.js";

function getActorContext(request: Request): ExportActorContext {
  const userId = request.user?.userId;
  const workspaceId = request.workspaceId ?? request.user?.workspaceId;
  const role = request.user?.role;

  if (!userId || !role) {
    throw new ApiError(401, EXPORT_MESSAGES.authenticationRequired);
  }

  if (!workspaceId) {
    throw new ApiError(400, EXPORT_MESSAGES.workspaceRequired);
  }

  return { userId, workspaceId, role };
}

function getExportId(request: Request): string {
  return request.params.exportId as string;
}

export const exportController: {
  create: RequestHandler;
  list: RequestHandler;
  getById: RequestHandler;
  download: RequestHandler;
} = {
  create: async (request, response, next) => {
    try {
      const context = getActorContext(request);

      const result = await exportService.create(
        context,
        request.body as CreateExportInput,
      );

      response.status(201).json({
        success: true,
        message: EXPORT_MESSAGES.created,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  list: async (request, response, next) => {
    try {
      const context = getActorContext(request);

      const result = await exportService.list(
        context,
        request.query as unknown as ExportListFilters,
      );

      response.status(200).json({
        success: true,
        message: EXPORT_MESSAGES.listed,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  getById: async (request, response, next) => {
    try {
      const context = getActorContext(request);

      const result = await exportService.getById(
        context,
        getExportId(request),
      );

      response.status(200).json({
        success: true,
        message: EXPORT_MESSAGES.retrieved,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  download: async (request, response, next) => {
    try {
      const context = getActorContext(request);

      const download = await exportService.getDownload(
        context,
        getExportId(request),
      );

      response.download(download.filePath, download.fileName);
    } catch (error) {
      next(error);
    }
  },
};
