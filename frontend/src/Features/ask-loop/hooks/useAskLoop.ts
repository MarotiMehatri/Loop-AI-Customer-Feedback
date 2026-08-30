"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  askLoop,
  getAskLoopConversations,
  getSavedAskLoopQueries,
  saveAskLoopQuery,
  sendAskLoopFeedback,
} from "../api/ask-loop.api";

import type {
  AskLoopAskRequest,
  AskLoopFeedbackRequest,
} from "../ask-loop.types";

export function useAskLoopConversations() {
  return useQuery({
    queryKey: ["ask-loop", "conversations"],
    queryFn: getAskLoopConversations,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useSavedAskLoopQueries() {
  return useQuery({
    queryKey: ["ask-loop", "saved-queries"],
    queryFn: getSavedAskLoopQueries,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useAskLoopMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AskLoopAskRequest) =>
      askLoop(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "ask-loop",
          "conversations",
        ],
      });
    },
  });
}

export function useSaveAskLoopQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      question,
      label,
    }: {
      question: string;
      label?: string;
    }) =>
      saveAskLoopQuery(
        question,
        label,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "ask-loop",
          "saved-queries",
        ],
      });
    },
  });
}

export function useAskLoopFeedback() {
  return useMutation({
    mutationFn: (
      payload: AskLoopFeedbackRequest,
    ) =>
      sendAskLoopFeedback(payload),
  });
}