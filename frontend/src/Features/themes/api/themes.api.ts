import { apiClient } from "../../../lib/api/api-client";
import type {
  CreateThemePayload,
  ThemeAnalyticsResponse,
  ThemeListResponse,
  ThemeRecord,
  ThemeSummaryResponse,
  UpdateThemePayload,
} from "../themes.types";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

function unwrap<T>(value: T | ApiEnvelope<T>): T {
  if (
    value &&
    typeof value === "object" &&
    "data" in (value as Record<string, unknown>)
  ) {
    return (value as ApiEnvelope<T>).data;
  }
  return value as T;
}

/**
 * Exact backend routes from src/modules/themes/theme.routes.ts:
 *   GET    /api/v1/theme/summary
 *   GET    /api/v1/theme
 *   POST   /api/v1/theme
 *   GET    /api/v1/theme/:themeId
 *   PATCH  /api/v1/theme/:themeId
 *   DELETE /api/v1/theme/:themeId (ADMIN only)
 *   GET    /api/v1/theme/:themeId/analytics
 */
export async function getThemeSummary(): Promise<ThemeSummaryResponse> {
  const response = await apiClient.get<
    ThemeSummaryResponse | ApiEnvelope<ThemeSummaryResponse>
  >("/theme/summary");

  return unwrap(response.data);
}

export async function getThemes(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "ARCHIVED";
  isAiGenerated?: boolean;
  sortBy?: "name" | "status" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}): Promise<ThemeListResponse> {
  const response = await apiClient.get<
    ThemeListResponse | ApiEnvelope<ThemeListResponse>
  >("/theme", {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.isAiGenerated !== undefined
        ? { isAiGenerated: params.isAiGenerated }
        : {}),
      sortBy: params?.sortBy ?? "createdAt",
      sortOrder: params?.sortOrder ?? "desc",
    },
  });

  return unwrap(response.data);
}

export async function getTheme(id: string): Promise<ThemeRecord> {
  const response = await apiClient.get<
    ThemeRecord | ApiEnvelope<ThemeRecord>
  >(`/theme/${id}`);

  return unwrap(response.data);
}

export async function getThemeAnalytics(
  id: string,
): Promise<ThemeAnalyticsResponse> {
  const response = await apiClient.get<
    ThemeAnalyticsResponse | ApiEnvelope<ThemeAnalyticsResponse>
  >(`/theme/${id}/analytics`);

  return unwrap(response.data);
}

export async function createTheme(
  payload: CreateThemePayload,
): Promise<ThemeRecord> {
  const response = await apiClient.post<
    ThemeRecord | ApiEnvelope<ThemeRecord>
  >("/theme", payload);

  return unwrap(response.data);
}

export async function updateTheme(
  id: string,
  payload: UpdateThemePayload,
): Promise<ThemeRecord> {
  const response = await apiClient.patch<
    ThemeRecord | ApiEnvelope<ThemeRecord>
  >(`/theme/${id}`, payload);

  return unwrap(response.data);
}

export async function archiveTheme(id: string): Promise<ThemeRecord> {
  return updateTheme(id, { status: "ARCHIVED" });
}

export async function restoreTheme(id: string): Promise<ThemeRecord> {
  return updateTheme(id, { status: "ACTIVE" });
}

/** Backend permits this DELETE only for ADMIN. Analyst UI should not call it. */
export async function deleteTheme(id: string): Promise<void> {
  await apiClient.delete(`/theme/${id}`);
}
