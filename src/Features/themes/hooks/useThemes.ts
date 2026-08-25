'use client';
import { useQuery } from '@tanstack/react-query';
import { getThemes, getThemeSummary } from '../api/themes.api';

export function useThemes(params: { page: number; limit: number; search?: string; status?: string }) { return useQuery({ queryKey: ['themes', params], queryFn: () => getThemes(params) }); }
export function useThemeSummary() { return useQuery({ queryKey: ['themes', 'summary'], queryFn: getThemeSummary }); }
