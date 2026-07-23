import * as dashboardRepo from "../repositories/dashboard.repository.js";
import { getStartDate, getEndDate } from "../utils/dateRange.js";

export async function getOverview(workspaceId: string, startDate?: string, endDate?: string) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);

  const [
    totalShipments,
    deliveredShipments,
    failedShipments,
    inTransitShipments,
    totalRevenue,
    uniqueCustomers,
    topCouriers,
    recentActivity,
  ] = await Promise.all([
    dashboardRepo.countShipments(workspaceId, start, end),
    dashboardRepo.countShipmentsByStatus(workspaceId, start, end, "DELIVERED"),
    dashboardRepo.countShipmentsByStatus(workspaceId, start, end, "FAILED"),
    dashboardRepo.countShipmentsByStatus(workspaceId, start, end, "IN_TRANSIT"),
    dashboardRepo.sumRevenue(workspaceId, start, end),
    dashboardRepo.countUniqueCustomers(workspaceId, start, end),
    dashboardRepo.getTopCouriers(workspaceId, start, end, 5),
    dashboardRepo.getRecentActivity(workspaceId, 10),
  ]);

  const deliveryRate =
    totalShipments > 0 ? ((deliveredShipments / totalShipments) * 100).toFixed(1) : "0.0";

  const failureRate =
    totalShipments > 0 ? ((failedShipments / totalShipments) * 100).toFixed(1) : "0.0";

  return {
    totalShipments,
    deliveredShipments,
    failedShipments,
    inTransitShipments,
    totalRevenue,
    uniqueCustomers,
    deliveryRate: parseFloat(deliveryRate),
    failureRate: parseFloat(failureRate),
    topCouriers,
    recentActivity,
    period: { start, end },
  };
}

export async function getShipmentSummary(workspaceId: string, startDate?: string, endDate?: string) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);

  const [statusCounts, channelBreakdown, dailyTrend] = await Promise.all([
    dashboardRepo.getShipmentStatusCounts(workspaceId, start, end),
    dashboardRepo.getChannelBreakdown(workspaceId, start, end),
    dashboardRepo.getDailyShipmentTrend(workspaceId, start, end),
  ]);

  return {
    statusCounts,
    channelBreakdown,
    dailyTrend,
    period: { start, end },
  };
}

export async function getDeliveryPerformance(workspaceId: string, startDate?: string, endDate?: string) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);

  const [onTimeRate, averageDeliveryTime, performanceByCourier, performanceTrend] =
    await Promise.all([
      dashboardRepo.getOnTimeDeliveryRate(workspaceId, start, end),
      dashboardRepo.getAverageDeliveryTime(workspaceId, start, end),
      dashboardRepo.getDeliveryPerformanceByCourier(workspaceId, start, end),
      dashboardRepo.getDeliveryPerformanceTrend(workspaceId, start, end),
    ]);

  return {
    onTimeRate,
    averageDeliveryTime,
    performanceByCourier,
    performanceTrend,
    period: { start, end },
  };
}

export async function getCourierPerformance(workspaceId: string, startDate?: string, endDate?: string) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);

  const [courierStats, courierRankings, courierTrend] = await Promise.all([
    dashboardRepo.getCourierStats(workspaceId, start, end),
    dashboardRepo.getCourierRankings(workspaceId, start, end),
    dashboardRepo.getCourierPerformanceTrend(workspaceId, start, end),
  ]);

  return {
    courierStats,
    courierRankings,
    courierTrend,
    period: { start, end },
  };
}

export async function getFailedDeliveries(
  workspaceId: string,
  startDate?: string,
  endDate?: string,
  page = 1,
  limit = 20,
) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    dashboardRepo.getFailedDeliveries(workspaceId, start, end, skip, limit),
    dashboardRepo.countFailedDeliveries(workspaceId, start, end),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    period: { start, end },
  };
}

export async function getDelayedShipments(
  workspaceId: string,
  startDate?: string,
  endDate?: string,
  page = 1,
  limit = 20,
) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    dashboardRepo.getDelayedShipments(workspaceId, start, end, skip, limit),
    dashboardRepo.countDelayedShipments(workspaceId, start, end),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    period: { start, end },
  };
}

export async function getMonthlyReport(workspaceId: string, month?: number, year?: number) {
  const now = new Date();
  const targetMonth = month ?? now.getMonth() + 1;
  const targetYear = year ?? now.getFullYear();

  const start = new Date(targetYear, targetMonth - 1, 1);
  const end = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

  const [summary, dailyBreakdown, topIssues, courierPerformance] = await Promise.all([
    dashboardRepo.getMonthlyShipmentSummary(workspaceId, start, end),
    dashboardRepo.getMonthlyDailyBreakdown(workspaceId, start, end),
    dashboardRepo.getMonthlyTopIssues(workspaceId, start, end),
    dashboardRepo.getMonthlyCourierPerformance(workspaceId, start, end),
  ]);

  return {
    month: targetMonth,
    year: targetYear,
    summary,
    dailyBreakdown,
    topIssues,
    courierPerformance,
  };
}

export async function getKPIs(workspaceId: string, startDate?: string, endDate?: string) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);

  const [totalShipments, deliveredCount, failedCount, avgDeliveryTime, customerSatisfaction, revenueGrowth] =
    await Promise.all([
      dashboardRepo.countShipments(workspaceId, start, end),
      dashboardRepo.countShipmentsByStatus(workspaceId, start, end, "DELIVERED"),
      dashboardRepo.countShipmentsByStatus(workspaceId, start, end, "FAILED"),
      dashboardRepo.getAverageDeliveryTime(workspaceId, start, end),
      dashboardRepo.getCustomerSatisfactionScore(workspaceId, start, end),
      dashboardRepo.getRevenueGrowth(workspaceId, start, end),
    ]);

  const deliveryRate = totalShipments > 0 ? (deliveredCount / totalShipments) * 100 : 0;

  const safeStart = start ?? new Date(0);
  const safeEnd = end ?? new Date();
  const previousStart = new Date(safeStart);
  previousStart.setDate(previousStart.getDate() - (safeEnd.getTime() - safeStart.getTime()) / (1000 * 60 * 60 * 24));
  const previousEnd = new Date(safeStart);
  previousEnd.setDate(previousEnd.getDate() - 1);

  const prevDeliveredCount = await dashboardRepo.countShipmentsByStatus(
    workspaceId,
    previousStart,
    previousEnd,
    "DELIVERED",
  );
  const prevTotalShipments = await dashboardRepo.countShipments(workspaceId, previousStart, previousEnd);
  const previousDeliveryRate = prevTotalShipments > 0 ? (prevDeliveredCount / prevTotalShipments) * 100 : 0;

  return {
    totalShipments,
    deliveredCount,
    failedCount,
    deliveryRate: parseFloat(deliveryRate.toFixed(1)),
    deliveryRateChange: parseFloat((deliveryRate - previousDeliveryRate).toFixed(1)),
    avgDeliveryTime,
    customerSatisfaction,
    revenueGrowth,
    period: { start, end },
  };
}
