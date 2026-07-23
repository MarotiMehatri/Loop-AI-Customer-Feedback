import * as insightRepo from "../repositories/insight.repository.js";
import { getStartDate, getEndDate } from "../utils/dateRange.js";

export async function getTopCouriers(
  workspaceId: string,
  startDate?: string,
  endDate?: string,
  limit = 10,
) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);

  const couriers = await insightRepo.getTopPerformingCouriers(workspaceId, start, end, limit);

  const enriched = couriers.map((courier: Record<string, unknown>, index: number) => ({
    rank: index + 1,
    ...courier,
  }));

  return {
    couriers: enriched,
    period: { start, end },
  };
}

export async function getWorstPerforming(
  workspaceId: string,
  startDate?: string,
  endDate?: string,
  limit = 10,
) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);

  const couriers = await insightRepo.getWorstPerformingCouriers(workspaceId, start, end, limit);

  const enriched = couriers.map((courier: Record<string, unknown>, index: number) => ({
    rank: index + 1,
    ...courier,
  }));

  return {
    couriers: enriched,
    period: { start, end },
  };
}

export async function getFrequentDelays(
  workspaceId: string,
  startDate?: string,
  endDate?: string,
  threshold = 3,
) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);

  const [delayPatterns, delayHotspots, delayTrends] = await Promise.all([
    insightRepo.getDelayPatterns(workspaceId, start, end, threshold),
    insightRepo.getDelayHotspots(workspaceId, start, end, threshold),
    insightRepo.getDelayTrends(workspaceId, start, end),
  ]);

  return {
    delayPatterns,
    delayHotspots,
    delayTrends,
    threshold,
    period: { start, end },
  };
}

export async function getRegionAnalysis(
  workspaceId: string,
  startDate?: string,
  endDate?: string,
  region?: string,
) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);

  const [regionStats, regionalPerformance, topRegions] = await Promise.all([
    insightRepo.getRegionStats(workspaceId, start, end, region),
    insightRepo.getRegionalPerformance(workspaceId, start, end, region),
    insightRepo.getTopRegions(workspaceId, start, end, 10),
  ]);

  return {
    regionStats,
    regionalPerformance,
    topRegions,
    region,
    period: { start, end },
  };
}

export async function getCustomerAnalysis(
  workspaceId: string,
  startDate?: string,
  endDate?: string,
  customerId?: string,
) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);

  const [customerMetrics, segments, satisfactionTrend] = await Promise.all([
    insightRepo.getCustomerMetrics(workspaceId, start, end, customerId),
    insightRepo.getCustomerSegments(workspaceId, start, end, customerId),
    insightRepo.getCustomerSatisfactionTrend(workspaceId, start, end, customerId),
  ]);

  return {
    customerMetrics,
    segments,
    satisfactionTrend,
    customerId,
    period: { start, end },
  };
}

export async function getRecommendations(workspaceId: string, category?: string) {
  const [
    courierRecommendations,
    routeRecommendations,
    processRecommendations,
  ] = await Promise.all([
    insightRepo.getCourierRecommendations(workspaceId, category),
    insightRepo.getRouteRecommendations(workspaceId, category),
    insightRepo.getProcessRecommendations(workspaceId, category),
  ]);

  return {
    courierRecommendations,
    routeRecommendations,
    processRecommendations,
    category,
  };
}
