import { ApiError } from "../../utils/apiError.js";

import {
  createFeedbackRecord,
  deleteFeedbackRecord,
  findFeedbackById,
  findFeedbackList,
  updateFeedbackRecord,
  updateFeedbackStatusRecord,
} from "./feedback.repository.js";

import { mapFeedbackResponse } from "./feedback.mapper.js";

import type {
  CreateFeedbackInput,
  FeedbackListFilters,
  PaginationMetadata,
  UpdateFeedbackInput,
  UpdateFeedbackStatusInput,
} from "./feedback.types.js";

const normalizeTags = (tags: string[] | undefined): string[] => {
  if (!tags) {
    return [];
  }

  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
};

export const createFeedback = async (
  input: CreateFeedbackInput,
  workspaceId: string,
  userId: string,
) => {
  const feedback = await createFeedbackRecord({
    ...input,

    customerName: input.customerName?.trim() || undefined,

    customerEmail: input.customerEmail?.trim().toLowerCase() || undefined,

    content: input.content.trim(),

    category: input.category?.trim() || undefined,

    tags: normalizeTags(input.tags),

    workspaceId,
    createdById: userId,
  });

  return mapFeedbackResponse(feedback);
};

export const getFeedback = async (feedbackId: string, workspaceId: string) => {
  const feedback = await findFeedbackById(feedbackId, workspaceId);

  if (!feedback) {
    throw new ApiError(404, "Feedback record was not found");
  }

  return mapFeedbackResponse(feedback);
};

export const getFeedbackList = async (
  workspaceId: string,
  filters: FeedbackListFilters,
) => {
  if (
    filters.createdFrom &&
    filters.createdTo &&
    filters.createdFrom > filters.createdTo
  ) {
    throw new ApiError(400, "createdFrom cannot be later than createdTo");
  }

  const result = await findFeedbackList(workspaceId, filters);

  const totalPages = Math.ceil(result.totalItems / filters.limit);

  const pagination: PaginationMetadata = {
    page: filters.page,
    limit: filters.limit,
    totalItems: result.totalItems,
    totalPages,
    hasNextPage: filters.page < totalPages,
    hasPreviousPage: filters.page > 1,
  };

  return {
    feedbacks: result.feedbacks.map(mapFeedbackResponse),

    pagination,
  };
};

export const updateFeedback = async (
  feedbackId: string,
  workspaceId: string,
  input: UpdateFeedbackInput,
) => {
  await getFeedback(feedbackId, workspaceId);

  const normalizedInput: UpdateFeedbackInput = {
    ...input,

    ...(input.customerName !== undefined
      ? {
          customerName: input.customerName?.trim() || null,
        }
      : {}),

    ...(input.customerEmail !== undefined
      ? {
          customerEmail: input.customerEmail?.trim().toLowerCase() || null,
        }
      : {}),

    ...(input.content !== undefined
      ? {
          content: input.content.trim(),
        }
      : {}),

    ...(input.category !== undefined
      ? {
          category: input.category?.trim() || null,
        }
      : {}),

    ...(input.tags !== undefined
      ? {
          tags: normalizeTags(input.tags),
        }
      : {}),
  };

  const feedback = await updateFeedbackRecord(
    feedbackId,
    workspaceId,
    normalizedInput,
  );

  return mapFeedbackResponse(feedback);
};

export const updateFeedbackStatus = async (
  feedbackId: string,
  workspaceId: string,
  input: UpdateFeedbackStatusInput,
) => {
  await getFeedback(feedbackId, workspaceId);

  const feedback = await updateFeedbackStatusRecord(
    feedbackId,
    workspaceId,
    input.status,
  );

  return mapFeedbackResponse(feedback);
};

export const deleteFeedback = async (
  feedbackId: string,
  workspaceId: string,
) => {
  await getFeedback(feedbackId, workspaceId);

  await deleteFeedbackRecord(feedbackId, workspaceId);
};
