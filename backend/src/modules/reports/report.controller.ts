import type { NextFunction, Request, Response } from "express";

import { ApiError } from "../../utils/apiError.js";

import { reportService } from "./report.service.js";

import type {
  CreateReportInput,
  ReportExportFormat,
  ReportListQuery,
  ReportPreviewInput,
  ReportScheduleInput,
  UpdateReportInput,
} from "./report.types.js";

function getRequestContext(request: Request): {
  userId: string;
  workspaceId: string;
} {
  const userId = request.user?.userId;

  const workspaceId = request.workspaceId ?? request.user?.workspaceId;

  if (!userId) {
    throw new ApiError(401, "Authentication required");
  }

  if (!workspaceId) {
    throw new ApiError(400, "Workspace is required");
  }

  return {
    userId,
    workspaceId,
  };
}

export const reportController = {
  async create(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { userId, workspaceId } = getRequestContext(request);

      const result = await reportService.create(
        workspaceId,
        userId,
        request.body as CreateReportInput,
      );

      response.status(201).json({
        success: true,
        message: "Report created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async list(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { workspaceId } = getRequestContext(request);

      const result = await reportService.list(
        workspaceId,
        request.query as unknown as ReportListQuery,
      );

      response.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { workspaceId } = getRequestContext(request);

      const reportId = request.params.reportId as string;

      const result = await reportService.getById(reportId, workspaceId);

      response.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { userId, workspaceId } = getRequestContext(request);

      const reportId = request.params.reportId as string;

      const input = request.body as UpdateReportInput;

      const result = await reportService.update(
        reportId,
        workspaceId,
        userId,
        input,
      );

      response.status(200).json({
        success: true,
        message: "Report updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { userId, workspaceId } = getRequestContext(request);

      const reportId = request.params.reportId as string;

      await reportService.delete(reportId, workspaceId, userId);

      response.status(200).json({
        success: true,
        message: "Report deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  async summary(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { workspaceId } = getRequestContext(request);

      const result = await reportService.getSummary(workspaceId);

      response.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async recent(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { workspaceId } = getRequestContext(request);

      const requestedLimit = Number(request.query.limit);

      const limit = Math.min(
        Math.max(Number.isFinite(requestedLimit) ? requestedLimit : 5, 1),
        20,
      );

      const result = await reportService.getRecent(workspaceId, limit);

      response.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async preview(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { workspaceId } = getRequestContext(request);

      const result = await reportService.preview(
        workspaceId,
        request.body as ReportPreviewInput,
      );

      response.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async generate(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { userId, workspaceId } = getRequestContext(request);

      const reportId = request.params.reportId as string;

      const result = await reportService.generate(
        reportId,
        workspaceId,
        userId,
      );

      response.status(200).json({
        success: true,
        message: "Report generated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async export(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { userId, workspaceId } = getRequestContext(request);

      const reportId = request.params.reportId as string;

      const format = String(
        request.query.format ?? "CSV",
      ).toUpperCase() as ReportExportFormat;

      const result = await reportService.export(
        reportId,
        workspaceId,
        userId,
        format,
      );

      response.setHeader("Content-Type", result.contentType);

      response.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.fileName}"`,
      );

      response.status(200).send(result.content);
    } catch (error) {
      next(error);
    }
  },

  async schedule(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { userId, workspaceId } = getRequestContext(request);

      const reportId = request.params.reportId as string;

      const input = request.body as ReportScheduleInput;

      const result = await reportService.schedule(
        reportId,
        workspaceId,
        userId,
        input,
      );

      response.status(200).json({
        success: true,
        message: "Report scheduled successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
