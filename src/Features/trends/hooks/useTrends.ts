'use client';
import { useQuery } from '@tanstack/react-query';
import { getTrend } from '../api/trends.api';
export function useTrends(metric = 'feedback_count') { return useQuery({ queryKey: ['trends', metric], queryFn: () => getTrend(metric) }); }
