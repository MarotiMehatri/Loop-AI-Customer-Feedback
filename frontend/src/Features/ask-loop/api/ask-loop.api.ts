import { apiClient } from "../../../lib/api/api-client";

import type {
  AskLoopAskRequest,
  AskLoopAskResponse,
  AskLoopConversation,
  AskLoopFeedbackRequest,
  SavedAskLoopQuery,
} from "../ask-loop.types";

export async function askLoop(
  payload: AskLoopAskRequest,
): Promise<AskLoopAskResponse> {
  const response =
    await apiClient.post<AskLoopAskResponse>(
      "/ask-loop/ask",
      payload,
    );

  return response.data;
}

export async function getAskLoopConversations(): Promise<
  AskLoopConversation[]
> {
  const response =
    await apiClient.get<AskLoopConversation[]>(
      "/ask-loop/conversations",
    );

  return response.data;
}

export async function getAskLoopConversation(
  conversationId: string,
): Promise<AskLoopConversation> {
  const response =
    await apiClient.get<AskLoopConversation>(
      `/ask-loop/conversations/${conversationId}`,
    );

  return response.data;
}

export async function saveAskLoopQuery(
  question: string,
  label?: string,
): Promise<SavedAskLoopQuery> {
  const response =
    await apiClient.post<SavedAskLoopQuery>(
      "/ask-loop/saved-queries",
      {
        question,
        label,
      },
    );

  return response.data;
}

export async function getSavedAskLoopQueries(): Promise<
  SavedAskLoopQuery[]
> {
  const response =
    await apiClient.get<SavedAskLoopQuery[]>(
      "/ask-loop/saved-queries",
    );

  return response.data;
}

export async function sendAskLoopFeedback(
  payload: AskLoopFeedbackRequest,
): Promise<void> {
  await apiClient.post(
    "/ask-loop/message-feedback",
    payload,
  );
}