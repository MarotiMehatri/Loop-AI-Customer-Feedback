import { apiClient } from "../../../lib/api/api-client";

import type {
  FeedbackInboxParams,
  FeedbackInboxResponse,
} from "../feedback.types";

export async function getFeedbackInbox(
  params: FeedbackInboxParams = {},
): Promise<FeedbackInboxResponse> {
  const response = await apiClient.get<FeedbackInboxResponse>(
    "/feedback-inbox",
    {
      params,
    },
  );

  return response.data;
}

export async function exportFeedbackInbox(
  params: FeedbackInboxParams = {},
) {
  const response = await apiClient.get(
    "/feedback-inbox/export",
    {
      params,
      responseType: "blob",
    },
  );

  return response.data;
}