import { apiClient } from '../../../lib/api/api-client';
import type { ApiResponse } from '../../../lib/api/api-response';
export type TrendPoint = { date: string; value: number; label?: string };
export type TrendResult = { data: TrendPoint[]; summary: { total: number; average: number; change: number; changePercentage: number } };
export async function getTrend(metric = 'feedback_count') { const { data } = await apiClient.get<ApiResponse<TrendResult>>('/trends', { params: { period: 'day', metric } }); return data.data; }
