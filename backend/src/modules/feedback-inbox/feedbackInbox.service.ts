import type { FeedbackStatus } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

import {
  deleteFeedbackInboxRecord,
  findFeedbackInboxById,
  findFeedbackInboxItems,
  findFeedbackInboxSummary,
  updateFeedbackInboxRecord,
  updateFeedbackInboxStatusRecord,
} from "./feedbackInbox.repository.js";

import type {
  FeedbackInboxQuery,
  FeedbackInboxSummary,
  UpdateFeedbackInboxInput,
} from "./feedbackInbox.types.js";

const calculatePercentage = (count: number, total: number): number => {
  if (total === 0) {
    return 0;
  }

  return Number(((count / total) * 100).toFixed(1));
};

export const getFeedbackInbox = async (
  workspaceId: string,
  query: FeedbackInboxQuery,
) => {
  const result = await findFeedbackInboxItems(workspaceId, query);

  const totalPages = Math.ceil(result.total / query.limit);

  return {
    items: result.items,

    pagination: {
      page: query.page,
      limit: query.limit,
      total: result.total,
      totalPages,
      hasNextPage: query.page < totalPages,
      hasPreviousPage: query.page > 1,
    },
  };
};

export const getFeedbackInboxSummary = async (
  workspaceId: string,
): Promise<FeedbackInboxSummary> => {
  const summary = await findFeedbackInboxSummary(workspaceId);

  return {
    totalFeedback: summary.totalFeedback,

    positive: {
      count: summary.positive,
      percentage: calculatePercentage(summary.positive, summary.totalFeedback),
    },

    neutral: {
      count: summary.neutral,
      percentage: calculatePercentage(summary.neutral, summary.totalFeedback),
    },

    negative: {
      count: summary.negative,
      percentage: calculatePercentage(summary.negative, summary.totalFeedback),
    },

    unresolved: summary.unresolved,
  };
};

export const getFeedbackInboxDetails = async (
  feedbackId: string,
  workspaceId: string,
) => {
  const feedback = await findFeedbackInboxById(feedbackId, workspaceId);

  if (!feedback) {
    throw new ApiError(404, "Feedback not found");
  }

  return feedback;
};

export const updateFeedbackInbox = async (
  feedbackId: string,
  workspaceId: string,
  input: UpdateFeedbackInboxInput,
) => {
  await getFeedbackInboxDetails(feedbackId, workspaceId);

  return updateFeedbackInboxRecord(feedbackId, input);
};

export const changeFeedbackInboxStatus = async (
  feedbackId: string,
  workspaceId: string,
  status: FeedbackStatus,
) => {
  await getFeedbackInboxDetails(feedbackId, workspaceId);

  return updateFeedbackInboxStatusRecord(feedbackId, status);
};

export const removeFeedbackInbox = async (
  feedbackId: string,
  workspaceId: string,
) => {
  await getFeedbackInboxDetails(feedbackId, workspaceId);

  await deleteFeedbackInboxRecord(feedbackId);
};
