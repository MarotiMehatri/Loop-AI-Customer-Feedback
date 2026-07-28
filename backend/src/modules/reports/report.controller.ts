import type { NextFunction, Request, RequestHandler } from "express";

import { ApiError } from "../../utils/apiError.js";
import { REPORT_MESSAGES } from "./report.constants.js";
import { reportService } from "./report.service.js";
import type { ReportActorContext, ReportExportFormat } from "./report.types.js";

function getReportContext(request: Request): ReportActorContext {
  const userId = request.user?.userId;
  const workspaceId = request.workspaceId ?? request.user?.workspaceId;
  const role = request.user?.role;

  if (!userId || !role) {
    throw new ApiError(401, "Authentication required");
  }

  if (!workspaceId) {
    throw new ApiError(400, "Workspace is required");
  }

  return { userId, workspaceId, role };
}

export const reportController: {
  create: RequestHandler;
  list: RequestHandler;
  getById: RequestHandler;
  update: RequestHandler;
  delete: RequestHandler;
  summary: RequestHandler;
  recent: RequestHandler;
  preview: RequestHandler;
  generate: RequestHandler;
  export: RequestHandler;
  schedule: RequestHandler;
} = {
  create: async (request, response, next) => {
    try {
      const actor = getReportContext(request);

      const result = await reportService.create(actor, request.body as never);

      response.status(201).json({
        success: true,
        message: REPORT_MESSAGES.created,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  list: async (request, response, next) => {
    try {
      const actor = getReportContext(request);

      const result = await reportService.list(actor, request.query as never);

      response.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  getById: async (request, response, next) => {
    try {
      const actor = getReportContext(request);

      const result = await reportService.getById(actor, request.params.reportId as string);

      response.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  update: async (request, response, next) => {
    try {
      const actor = getReportContext(request);

      const result = await reportService.update(
        actor,
        request.params.reportId as string,
        request.body as never,
      );

      response.status(200).json({
        success: true,
        message: REPORT_MESSAGES.updated,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  delete: async (request, response, next) => {
    try {
      const actor = getReportContext(request);

      await reportService.delete(actor, request.params.reportId as string);

      response.status(200).json({
        success: true,
        message: REPORT_MESSAGES.deleted,
      });
    } catch (error) {
      next(error);
    }
  },

  summary: async (request, response, next) => {
    try {
      const actor = getReportContext(request);

      const result = await reportService.getSummary(actor);

      response.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  recent: async (request, response, next) => {
    try {
      const actor = getReportContext(request);

      const requestedLimit = Number(request.query.limit);
      const limit = Math.min(
        Math.max(Number.isFinite(requestedLimit) ? requestedLimit : 5, 1),
        20,
      );

      const result = await reportService.getRecent(actor, limit);

      response.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  preview: async (request, response, next) => {
    try {
      const actor = getReportContext(request);

      const result = await reportService.preview(actor, request.body as never);

      response.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  generate: async (request, response, next) => {
    try {
      const actor = getReportContext(request);

      const result = await reportService.generate(actor, request.params.reportId as string);

      response.status(200).json({
        success: true,
        message: REPORT_MESSAGES.generated,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  export: async (request, response, next) => {
    try {
      const actor = getReportContext(request);

      const format = String(request.query.format ?? "CSV").toUpperCase() as ReportExportFormat;

      const result = await reportService.export(actor, request.params.reportId as string, format);

      response.setHeader("Content-Type", result.contentType);
      response.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
      response.status(200).send(result.content);
    } catch (error) {
      next(error);
    }
  },

  schedule: async (request, response, next) => {
    try {
      const actor = getReportContext(request);

      const result = await reportService.schedule(
        actor,
        request.params.reportId as string,
        request.body as never,
      );

      response.status(200).json({
        success: true,
        message: REPORT_MESSAGES.scheduled,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
