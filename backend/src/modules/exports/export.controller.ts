import type { Request, RequestHandler } from "express";

import { ApiError } from "../../utils/apiError.js";

import { EXPORT_MESSAGES } from "./export.constants.js";

import { exportService } from "./export.service.js";

import type {
  CreateExportInput,
  ExportActorContext,
  ExportListFilters,
} from "./export.types.js";

/* -------------------------------------------------------------------------- */
/* Actor Context                                                              */
/* -------------------------------------------------------------------------- */

function getActorContext(
  request: Request,
): ExportActorContext {
  const userId = request.user?.userId;

  const workspaceId =
    request.workspaceId ??
    request.user?.workspaceId;

  const role = request.user?.role;

  if (!userId || !role) {
    throw new ApiError(
      401,
      EXPORT_MESSAGES.authenticationRequired,
    );
  }

  if (!workspaceId) {
    throw new ApiError(
      400,
      EXPORT_MESSAGES.workspaceRequired,
    );
  }

  return {
    userId,
    workspaceId,
    role,
  };
}

/* -------------------------------------------------------------------------- */
/* Export ID                                                                  */
/* -------------------------------------------------------------------------- */

function getExportId(
  request: Request,
): string {
  const exportId = request.params.exportId;

  if (!exportId) {
    throw new ApiError(
      400,
      "Export ID is required.",
    );
  }

  return exportId;
}

/* -------------------------------------------------------------------------- */
/* Controller                                                                 */
/* -------------------------------------------------------------------------- */

export const exportController: {
  create: RequestHandler;
  list: RequestHandler;
  getById: RequestHandler;
  download: RequestHandler;
  remove: RequestHandler;
} = {
  /* ------------------------------------------------------------------------ */
  /* CREATE                                                                   */
  /* ------------------------------------------------------------------------ */

  create: async (
    request,
    response,
    next,
  ) => {
    try {
      const context =
        getActorContext(request);

      const result =
        await exportService.create(
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

  /* ------------------------------------------------------------------------ */
  /* LIST                                                                     */
  /* ------------------------------------------------------------------------ */

  list: async (
    request,
    response,
    next,
  ) => {
    try {
      const context =
        getActorContext(request);

      const result =
        await exportService.list(
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

  /* ------------------------------------------------------------------------ */
  /* GET BY ID                                                                */
  /* ------------------------------------------------------------------------ */

  getById: async (
    request,
    response,
    next,
  ) => {
    try {
      const context =
        getActorContext(request);

      const exportId =
        getExportId(request);

      const result =
        await exportService.getById(
          context,
          exportId,
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

  /* ------------------------------------------------------------------------ */
  /* DOWNLOAD                                                                 */
  /* ------------------------------------------------------------------------ */

  download: async (
    request,
    response,
    next,
  ) => {
    try {
      const context =
        getActorContext(request);

      const exportId =
        getExportId(request);

      const download =
        await exportService.getDownload(
          context,
          exportId,
        );

      response.download(
        download.filePath,
        download.fileName,
      );
    } catch (error) {
      next(error);
    }
  },

  /* ------------------------------------------------------------------------ */
  /* DELETE                                                                   */
  /* ------------------------------------------------------------------------ */

  remove: async (
  request,
  response,
  next,
) => {
  try {
    const context =
      getActorContext(request);

    const exportId =
      getExportId(request);

    const result =
      await exportService.remove(
        context,
        exportId,
      );

    response.status(200).json({
      success: true,
      message:
        EXPORT_MESSAGES.deleted ??
        "Export deleted successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
},
};