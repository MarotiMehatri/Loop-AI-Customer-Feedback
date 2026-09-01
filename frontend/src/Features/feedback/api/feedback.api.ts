import { apiClient } from "../../../lib/api/api-client";

import type {
  Feedback,
  FeedbackListFilters,
  FeedbackListResponse,
  CreateFeedbackPayload,
} from "../feedback.types";

/* -------------------------------------------------------------------------- */
/* Create Feedback                                                            */
/* -------------------------------------------------------------------------- */

export async function createFeedback(
  payload: CreateFeedbackPayload,
): Promise<Feedback> {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    data: Feedback;
  }>("/feedback", payload);

  return response.data.data;
}

/* -------------------------------------------------------------------------- */
/* Get Feedback Inbox                                                         */
/* -------------------------------------------------------------------------- */

export async function getFeedbackInbox(
  filters: FeedbackListFilters = {},
): Promise<FeedbackListResponse> {
  const params = new URLSearchParams();

  if (filters.page !== undefined) {
    params.set("page", String(filters.page));
  }

  if (filters.limit !== undefined) {
    params.set("limit", String(filters.limit));
  }

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.source) {
    params.set("source", filters.source);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.sentiment) {
    params.set("sentiment", filters.sentiment);
  }

  if (filters.category?.trim()) {
    params.set("category", filters.category.trim());
  }

  const query = params.toString();

  const response = await apiClient.get<{
    success: boolean;
    message: string;
    data: FeedbackListResponse;
  }>(
    `/feedback${query ? `?${query}` : ""}`,
  );

  return response.data.data;
}

/* -------------------------------------------------------------------------- */
/* Get Feedback By ID                                                         */
/* -------------------------------------------------------------------------- */

export async function getFeedbackById(
  feedbackId: string,
): Promise<Feedback> {
  const response = await apiClient.get<{
    success: boolean;
    message: string;
    data: Feedback;
  }>(`/feedback/${feedbackId}`);

  return response.data.data;
}

/* -------------------------------------------------------------------------- */
/* Delete Feedback                                                            */
/* -------------------------------------------------------------------------- */

export async function deleteFeedback(
  feedbackId: string,
) {
  const response = await apiClient.delete<{
    success: boolean;
    message: string;
    data: {
      id: string;
      deleted: boolean;
    };
  }>(`/feedback/${feedbackId}`);

  return response.data.data;
}