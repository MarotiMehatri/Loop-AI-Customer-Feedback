import * as analyticsRepo from "../repositories/analytics.repository.js";
import { getStartDate, getEndDate } from "../utils/dateRange.js";

export async function getShipmentAnalytics(
  workspaceId: string,
  startDate?: string,
  endDate?: string,
  groupBy?: string,
) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);
  const validGroupBy = validateGroupBy(groupBy);

  const [shipmentTrend, statusDistribution, volumeByPeriod] = await Promise.all([
    analyticsRepo.getShipmentTrend(workspaceId, start, end, validGroupBy),
    analyticsRepo.getStatusDistribution(workspaceId, start, end),
    analyticsRepo.getVolumeByPeriod(workspaceId, start, end, validGroupBy),
  ]);

  return {
    shipmentTrend,
    statusDistribution,
    volumeByPeriod,
    period: { start, end },
    groupBy: validGroupBy,
  };
}

export async function getCourierAnalytics(
  workspaceId: string,
  startDate?: string,
  endDate?: string,
  courierId?: string,
) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);

  const [performanceComparison, deliveryMetrics, trendData] = await Promise.all([
    analyticsRepo.getCourierPerformanceComparison(workspaceId, start, end, courierId),
    analyticsRepo.getCourierDeliveryMetrics(workspaceId, start, end, courierId),
    analyticsRepo.getCourierTrendData(workspaceId, start, end, courierId),
  ]);

  return {
    performanceComparison,
    deliveryMetrics,
    trendData,
    period: { start, end },
    courierId,
  };
}

export async function getCustomerAnalytics(
  workspaceId: string,
  startDate?: string,
  endDate?: string,
  customerId?: string,
) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);

  const [customerSegments, satisfactionScores, orderFrequency] = await Promise.all([
    analyticsRepo.getCustomerSegments(workspaceId, start, end, customerId),
    analyticsRepo.getCustomerSatisfactionScores(workspaceId, start, end, customerId),
    analyticsRepo.getCustomerOrderFrequency(workspaceId, start, end, customerId),
  ]);

  return {
    customerSegments,
    satisfactionScores,
    orderFrequency,
    period: { start, end },
    customerId,
  };
}

export async function getDeliveryAnalytics(
  workspaceId: string,
  startDate?: string,
  endDate?: string,
  status?: string,
) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);

  const [statusBreakdown, timeAnalysis, failureAnalysis] = await Promise.all([
    analyticsRepo.getDeliveryStatusBreakdown(workspaceId, start, end, status),
    analyticsRepo.getDeliveryTimeAnalysis(workspaceId, start, end, status),
    analyticsRepo.getDeliveryFailureAnalysis(workspaceId, start, end, status),
  ]);

  return {
    statusBreakdown,
    timeAnalysis,
    failureAnalysis,
    period: { start, end },
    status,
  };
}

export async function getRevenueAnalytics(
  workspaceId: string,
  startDate?: string,
  endDate?: string,
  groupBy?: string,
) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);
  const validGroupBy = validateGroupBy(groupBy);

  const [revenueTrend, revenueByCourier, revenueByRegion, projectedRevenue] = await Promise.all([
    analyticsRepo.getRevenueTrend(workspaceId, start, end, validGroupBy),
    analyticsRepo.getRevenueByCourier(workspaceId, start, end),
    analyticsRepo.getRevenueByRegion(workspaceId, start, end),
    analyticsRepo.getProjectedRevenue(workspaceId, start, end),
  ]);

  return {
    revenueTrend,
    revenueByCourier,
    revenueByRegion,
    projectedRevenue,
    period: { start, end },
    groupBy: validGroupBy,
  };
}

export async function getTrendData(
  workspaceId: string,
  startDate?: string,
  endDate?: string,
  metric?: string,
  interval?: string,
) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);
  const validInterval = validateInterval(interval);
  const validMetric = metric || "shipments";

  const trendData = await analyticsRepo.getTrendData(
    workspaceId,
    start,
    end,
    validMetric,
    validInterval,
  );

  return {
    trendData,
    metric: validMetric,
    interval: validInterval,
    period: { start, end },
  };
}

export async function getHeatmapData(workspaceId: string, startDate?: string, endDate?: string) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);

  const [hourlyHeatmap, weeklyHeatmap, regionalHeatmap] = await Promise.all([
    analyticsRepo.getHourlyHeatmap(workspaceId, start, end),
    analyticsRepo.getWeeklyHeatmap(workspaceId, start, end),
    analyticsRepo.getRegionalHeatmap(workspaceId, start, end),
  ]);

  return {
    hourlyHeatmap,
    weeklyHeatmap,
    regionalHeatmap,
    period: { start, end },
  };
}

export async function getComparisonData(
  workspaceId: string,
  startDate?: string,
  endDate?: string,
  compareBy?: string,
  entities?: string[],
) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);
  const validCompareBy = validateCompareBy(compareBy);

  const [comparisonMetrics, historicalComparison] = await Promise.all([
    analyticsRepo.getComparisonMetrics(workspaceId, start, end, validCompareBy, entities),
    analyticsRepo.getHistoricalComparison(workspaceId, start, end, validCompareBy, entities),
  ]);

  return {
    comparisonMetrics,
    historicalComparison,
    period: { start, end },
    compareBy: validCompareBy,
    entities,
  };
}

export async function getFilters(workspaceId: string) {
  const [couriers, customers, regions, statuses, dateRange] = await Promise.all([
    analyticsRepo.getAvailableCouriers(workspaceId),
    analyticsRepo.getAvailableCustomers(workspaceId),
    analyticsRepo.getAvailableRegions(workspaceId),
    analyticsRepo.getAvailableStatuses(workspaceId),
    analyticsRepo.getDataDateRange(workspaceId),
  ]);

  return {
    couriers,
    customers,
    regions,
    statuses,
    dateRange,
  };
}

function validateGroupBy(groupBy?: string): "day" | "week" | "month" {
  const allowed: Array<"day" | "week" | "month"> = ["day", "week", "month"];
  if (groupBy && allowed.includes(groupBy as "day" | "week" | "month")) {
    return groupBy as "day" | "week" | "month";
  }
  return "day";
}

function validateInterval(interval?: string): "hourly" | "daily" | "weekly" | "monthly" {
  const allowed: Array<"hourly" | "daily" | "weekly" | "monthly"> = [
    "hourly",
    "daily",
    "weekly",
    "monthly",
  ];
  if (interval && allowed.includes(interval as "hourly" | "daily" | "weekly" | "monthly")) {
    return interval as "hourly" | "daily" | "weekly" | "monthly";
  }
  return "daily";
}

function validateCompareBy(compareBy?: string): "courier" | "region" | "status" {
  const allowed: Array<"courier" | "region" | "status"> = ["courier", "region", "status"];
  if (compareBy && allowed.includes(compareBy as "courier" | "region" | "status")) {
    return compareBy as "courier" | "region" | "status";
  }
  return "courier";
}
