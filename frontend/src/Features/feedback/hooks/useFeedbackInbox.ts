"use client";

import { useQuery } from "@tanstack/react-query";

import { getFeedbackInbox } from "../api/feedback.api";

import type { FeedbackInboxParams } from "../feedback.types";

export function useFeedbackInbox(
  params: FeedbackInboxParams = {},
) {
  return useQuery({
    queryKey: [
      "feedback-inbox",
      params,
    ],

    queryFn: () => getFeedbackInbox(params),

    staleTime: 30_000,

    placeholderData: (previousData) =>
      previousData,
  });
}