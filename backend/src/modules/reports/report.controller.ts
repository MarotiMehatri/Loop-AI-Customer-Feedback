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

      const result = await reportService.getById(
        request.params.reportId as string,
        workspaceId,
      );

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
      const { workspaceId } = getRequestContext(request);

      const result = await reportService.update(
        request.params.reportId as string,
        workspaceId,
        request.body as UpdateReportInput,
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
      const { workspaceId } = getRequestContext(request);

      await reportService.delete(
        request.params.reportId as string,
        workspaceId,
      );

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

      const limit = Math.min(Math.max(Number(request.query.limit) || 5, 1), 20);

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
      const { workspaceId } = getRequestContext(request);

      const result = await reportService.generate(
        request.params.reportId as string,
        workspaceId,
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
      const { workspaceId } = getRequestContext(request);

      const format = String(
        request.query.format ?? "CSV",
      ).toUpperCase() as ReportExportFormat;

      const result = await reportService.export(
        request.params.reportId as string,
        workspaceId,
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
      const { workspaceId } = getRequestContext(request);

      const result = await reportService.schedule(
        request.params.reportId as string,
        workspaceId,
        request.body as ReportScheduleInput,
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
