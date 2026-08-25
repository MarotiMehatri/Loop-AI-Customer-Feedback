import { apiClient } from "../../../lib/api/api-client";
import type { ApiResponse, PaginatedData } from "../../../lib/api/api-response";
import type {
  AnalyticsDashboard,
  FeedbackStatus,
  InboxFeedback,
  InboxSummary,
} from "../analytics.types";

export interface AnalyticsQueryParams {
  days?: number;
  groupBy?: "day" | "week" | "month";
  sentiment?: string;
  status?: string;
  source?: string;
  category?: string;
}

export interface InboxQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sentiment?: string;
  status?: string;
  source?: string;
}

export async function getAnalytics(
  params?: AnalyticsQueryParams,
): Promise<AnalyticsDashboard> {
  const { data } = await apiClient.get<ApiResponse<AnalyticsDashboard>>(
    "/analytics",
    { params },
  );
  return data.data;
}

export async function getInboxSummary(): Promise<InboxSummary> {
  const { data } = await apiClient.get<ApiResponse<InboxSummary>>(
    "/feedback-inbox/summary",
  );
  return data.data;
}

export async function getInboxList(
  params?: InboxQueryParams,
): Promise<PaginatedData<InboxFeedback>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedData<InboxFeedback>>>(
    "/feedback-inbox",
    { params },
  );
  return data.data;
}

export async function getInboxStatusCount(
  status: FeedbackStatus,
): Promise<number> {
  const result = await getInboxList({ status, page: 1, limit: 1 });
  return result.pagination.total;
}

export async function getClassificationsCount(): Promise<number> {
  const { data } = await apiClient.get<ApiResponse<PaginatedData<unknown>>>(
    "/ai-classification",
    { params: { page: 1, limit: 1 } },
  );
  return data.data.pagination.total;
}
