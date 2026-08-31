import { apiClient } from "../../../lib/api/api-client";
import type { AnalyticsDashboard } from "../analytics.types";

export interface AnalyticsQuery {
  days?: number;
  source?:
    | "SUPPORT"
    | "APP_STORE"
    | "SURVEY"
    | "SALES"
    | "SOCIAL"
    | "WEBSITE"
    | "EMAIL"
    | "MANUAL";
  sentiment?: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  category?: string;
  theme?: string;
}

interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsDashboard;
}

export async function getAnalytics(
  query: AnalyticsQuery = {},
): Promise<AnalyticsDashboard> {
  const response = await apiClient.get<AnalyticsResponse>("/analytics", {
    params: query,
  });

  return response.data.data;
}

export async function exportAnalytics(
  query: AnalyticsQuery = {},
): Promise<Blob> {
  const response = await apiClient.get<Blob>("/analytics/export", {
    params: query,
    responseType: "blob",
  });

  return response.data;
}
