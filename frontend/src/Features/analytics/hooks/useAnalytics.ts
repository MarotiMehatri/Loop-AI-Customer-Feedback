import { useQuery } from "@tanstack/react-query";
import {
  getAnalytics,
  type AnalyticsQuery,
} from "../api/analytics.api";

export function useAnalytics(query: AnalyticsQuery = {}) {
  return useQuery({
    queryKey: ["analytics", query],
    queryFn: () => getAnalytics(query),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
