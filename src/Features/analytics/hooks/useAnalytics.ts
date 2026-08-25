"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getAnalytics,
  getClassificationsCount,
  getInboxList,
  getInboxStatusCount,
  getInboxSummary,
  type AnalyticsQueryParams,
  type InboxQueryParams,
} from "../api/analytics.api";
import type { FeedbackStatus } from "../analytics.types";

export function useAnalytics(params?: AnalyticsQueryParams) {
  return useQuery({
    queryKey: ["analytics", params],
    queryFn: () => getAnalytics(params),
  });
}

export function useInboxSummary() {
  return useQuery({
    queryKey: ["feedback-inbox", "summary"],
    queryFn: getInboxSummary,
  });
}

export function useInboxStatusCount(status: FeedbackStatus) {
  return useQuery({
    queryKey: ["feedback-inbox", "count", status],
    queryFn: () => getInboxStatusCount(status),
  });
}

export function useClassificationsCount() {
  return useQuery({
    queryKey: ["ai-classification", "count"],
    queryFn: getClassificationsCount,
  });
}

export function useInboxList(params?: InboxQueryParams) {
  return useQuery({
    queryKey: ["feedback-inbox", "list", params],
    queryFn: () => getInboxList(params),
  });
}
