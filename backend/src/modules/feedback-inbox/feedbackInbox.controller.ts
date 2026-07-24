import type { Request, Response } from "express";

import type { FeedbackStatus } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

import {
  changeFeedbackInboxStatus,
  getFeedbackInbox,
  getFeedbackInboxDetails,
  getFeedbackInboxSummary,
  removeFeedbackInbox,
  updateFeedbackInbox,
} from "./feedbackInbox.service.js";

import type {
  FeedbackInboxQuery,
  UpdateFeedbackInboxInput,
} from "./feedbackInbox.types.js";

const getAuthenticatedUser = (request: Request) => {
  if (!request.user) {
    throw new ApiError(401, "Authentication is required");
  }

  return request.user;
};

const getFeedbackId = (request: Request): string => {
  const feedbackId = request.params.feedbackId;

  if (typeof feedbackId !== "string" || feedbackId.trim().length === 0) {
    throw new ApiError(400, "Feedback ID is required");
  }

  return feedbackId;
};

export const listFeedbackInboxController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const query = request.query as unknown as FeedbackInboxQuery;

  const result = await getFeedbackInbox(user.workspaceId, query);

  response.status(200).json({
    success: true,
    message: "Feedback inbox retrieved successfully",
    data: result,
  });
};

export const feedbackInboxSummaryController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const summary = await getFeedbackInboxSummary(user.workspaceId);

  response.status(200).json({
    success: true,
    message: "Feedback inbox summary retrieved successfully",
    data: summary,
  });
};

export const getFeedbackInboxController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const feedbackId = getFeedbackId(request);

  const feedback = await getFeedbackInboxDetails(feedbackId, user.workspaceId);

  response.status(200).json({
    success: true,
    message: "Feedback retrieved successfully",
    data: {
      feedback,
    },
  });
};

export const updateFeedbackInboxController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const feedbackId = getFeedbackId(request);

  const input = request.body as UpdateFeedbackInboxInput;

  const feedback = await updateFeedbackInbox(
    feedbackId,
    user.workspaceId,
    input,
  );

  response.status(200).json({
    success: true,
    message: "Feedback updated successfully",
    data: {
      feedback,
    },
  });
};

export const updateFeedbackStatusController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const feedbackId = getFeedbackId(request);

  const { status } = request.body as {
    status: FeedbackStatus;
  };

  const feedback = await changeFeedbackInboxStatus(
    feedbackId,
    user.workspaceId,
    status,
  );

  response.status(200).json({
    success: true,
    message: "Feedback status updated successfully",
    data: {
      feedback,
    },
  });
};

export const deleteFeedbackInboxController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const feedbackId = getFeedbackId(request);

  await removeFeedbackInbox(feedbackId, user.workspaceId);

  response.status(200).json({
    success: true,
    message: "Feedback deleted successfully",
  });
};
