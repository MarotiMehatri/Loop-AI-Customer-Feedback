import type { Request, Response } from "express";

import { ApiError } from "../../utils/apiError.js";

import {
  createFeedback,
  deleteFeedback,
  getFeedback,
  getFeedbackList,
  updateFeedback,
  updateFeedbackStatus,
} from "./feedback.service.js";

import type {
  CreateFeedbackInput,
  FeedbackListFilters,
  UpdateFeedbackInput,
  UpdateFeedbackStatusInput,
} from "./feedback.types.js";

/**
 * Return the authenticated user added by authenticate.middleware.ts.
 */
const getAuthenticatedUser = (request: Request) => {
  if (!request.user) {
    throw new ApiError(401, "Authentication is required");
  }

  return request.user;
};

/**
 * Safely read feedbackId from route parameters.
 */
const getFeedbackId = (request: Request): string => {
  const feedbackId = request.params.feedbackId;

  if (typeof feedbackId !== "string" || feedbackId.trim().length === 0) {
    throw new ApiError(400, "Feedback ID is required");
  }

  return feedbackId.trim();
};

/**
 * POST /api/v1/feedback
 */
export const createFeedbackController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const feedback = await createFeedback(
    request.body as CreateFeedbackInput,
    user.workspaceId,
    user.userId,
  );

  response.status(201).json({
    success: true,
    message: "Feedback added successfully",
    data: {
      feedback,
    },
  });
};

/**
 * GET /api/v1/feedback
 */
export const listFeedbackController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const filters = request.query as unknown as FeedbackListFilters;

  const result = await getFeedbackList(user.workspaceId, filters);

  response.status(200).json({
    success: true,
    message: "Feedback retrieved successfully",
    data: result,
  });
};

/**
 * GET /api/v1/feedback/:feedbackId
 */
export const getFeedbackController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);
  const feedbackId = getFeedbackId(request);

  const feedback = await getFeedback(feedbackId, user.workspaceId);

  response.status(200).json({
    success: true,
    message: "Feedback retrieved successfully",
    data: {
      feedback,
    },
  });
};

/**
 * PATCH /api/v1/feedback/:feedbackId
 */
export const updateFeedbackController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);
  const feedbackId = getFeedbackId(request);

  const feedback = await updateFeedback(
    feedbackId,
    user.workspaceId,
    request.body as UpdateFeedbackInput,
  );

  response.status(200).json({
    success: true,
    message: "Feedback updated successfully",
    data: {
      feedback,
    },
  });
};

/**
 * PATCH /api/v1/feedback/:feedbackId/status
 */
export const updateFeedbackStatusController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);
  const feedbackId = getFeedbackId(request);

  const feedback = await updateFeedbackStatus(
    feedbackId,
    user.workspaceId,
    request.body as UpdateFeedbackStatusInput,
  );

  response.status(200).json({
    success: true,
    message: "Feedback status updated successfully",
    data: {
      feedback,
    },
  });
};

/**
 * DELETE /api/v1/feedback/:feedbackId
 */
export const deleteFeedbackController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);
  const feedbackId = getFeedbackId(request);

  await deleteFeedback(feedbackId, user.workspaceId);

  response.status(200).json({
    success: true,
    message: "Feedback deleted successfully",
  });
};
