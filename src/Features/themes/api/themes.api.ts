import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse } from '../../../lib/api/api-response';

export type ThemeRecord = { id: string; name: string; description: string | null; status: string; color: string | null; isAiGenerated: boolean; feedbackCount: number; createdAt: string; updatedAt: string };
export type ThemeList = { items: ThemeRecord[]; total: number };
export type ThemeSummary = { totalThemes: number; activeAssignments: number; aiGeneratedThemes: number; manuallyCreatedThemes: number; byStatus: { status: string; count: number }[] };

export async function getThemes(params: { page: number; limit: number; search?: string; status?: string }) {
  const { data } = await apiClient.get<ApiResponse<ThemeList>>('/theme', { params });
  return data.data;
}

export async function getThemeSummary() {
  const { data } = await apiClient.get<ApiResponse<ThemeSummary>>('/theme/summary');
  return data.data;
}
