import type { Request, Response } from "express";

import { ApiError } from "../../utils/apiError.js";

import { REPORT_MESSAGES } from "./report.constants.js";

import { reportService } from "./report.service.js";

import type {
  ReportActorContext,
  ReportExportFormat,
} from "./report.types.js";

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

export const createController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const actor = getReportContext(request);

  const result = await reportService.create(actor, request.body as never);

  response.status(201).json({
    success: true,
    message: REPORT_MESSAGES.created,
    data: result,
  });
};

export const listController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const actor = getReportContext(request);

  const result = await reportService.list(actor, request.query as never);

  response.status(200).json({
    success: true,
    data: result,
  });
};

export const getByIdController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const actor = getReportContext(request);

  const result = await reportService.getById(
    actor,
    request.params.reportId as string,
  );

  response.status(200).json({
    success: true,
    data: result,
  });
};

export const updateController = async (
  request: Request,
  response: Response,
): Promise<void> => {
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
};

export const deleteController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const actor = getReportContext(request);

  await reportService.delete(actor, request.params.reportId as string);

  response.status(200).json({
    success: true,
    message: REPORT_MESSAGES.deleted,
  });
};

export const summaryController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const actor = getReportContext(request);

  const result = await reportService.getSummary(actor);

  response.status(200).json({
    success: true,
    data: result,
  });
};

export const recentController = async (
  request: Request,
  response: Response,
): Promise<void> => {
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
};

export const previewController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const actor = getReportContext(request);

  const result = await reportService.preview(actor, request.body as never);

  response.status(200).json({
    success: true,
    data: result,
  });
};

export const generateController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const actor = getReportContext(request);

  const result = await reportService.generate(
    actor,
    request.params.reportId as string,
  );

  response.status(200).json({
    success: true,
    message: REPORT_MESSAGES.generated,
    data: result,
  });
};

export const exportController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const actor = getReportContext(request);

  const format = String(request.query.format ?? "CSV").toUpperCase() as ReportExportFormat;

  const result = await reportService.export(
    actor,
    request.params.reportId as string,
    format,
  );

  response.setHeader("Content-Type", result.contentType);
  response.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
  response.status(200).send(result.content);
};

export const scheduleController = async (
  request: Request,
  response: Response,
): Promise<void> => {
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
};
