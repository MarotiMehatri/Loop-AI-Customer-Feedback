import type { Request, Response } from "express";

import { ApiError } from "../../utils/apiError.js";

import {
  getFeedbackImportDetails,
  getFeedbackImportHistory,
  importFeedbackCsv,
  removeFeedbackImport,
} from "./feedbackImport.service.js";

import type { FeedbackImportListQuery } from "./feedbackImport.types.js";

const getAuthenticatedUser = (request: Request) => {
  if (!request.user) {
    throw new ApiError(401, "Authentication is required");
  }

  return request.user;
};

const getImportId = (request: Request): string => {
  const importId = request.params.importId;

  if (typeof importId !== "string" || importId.trim().length === 0) {
    throw new ApiError(400, "Import ID is required");
  }

  return importId;
};

export const importFeedbackCsvController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  if (!request.file) {
    throw new ApiError(400, "CSV file is required");
  }

  const result = await importFeedbackCsv({
    file: request.file,
    workspaceId: user.workspaceId,
    userId: user.userId,
  });

  response.status(201).json({
    success: true,
    message: "Feedback CSV import completed",
    data: result,
  });
};

export const listFeedbackImportsController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const query = request.query as unknown as FeedbackImportListQuery;

  const result = await getFeedbackImportHistory(user.workspaceId, query);

  response.status(200).json({
    success: true,
    message: "Feedback import history retrieved successfully",
    data: result,
  });
};

export const getFeedbackImportController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const importId = getImportId(request);

  const result = await getFeedbackImportDetails(importId, user.workspaceId);

  response.status(200).json({
    success: true,
    message: "Feedback import retrieved successfully",
    data: {
      import: result,
    },
  });
};

export const deleteFeedbackImportController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const importId = getImportId(request);

  await removeFeedbackImport(importId, user.workspaceId);

  response.status(200).json({
    success: true,
    message: "Feedback import history deleted successfully",
  });
};
