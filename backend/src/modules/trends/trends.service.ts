import { prisma } from "../../config/prisma.js";

import { assertCanViewTrends, assertCanDetectTrends, assertCanGenerateInsights } from "./trend.permissions.js";
import { trendDetectionService } from "./trend-detection.service.js";
import { trendInsightService } from "./trend-insight.service.js";

import type {
  TrendActorContext,
  TrendAnomalyQuery,
  TrendDataPoint,
  TrendDetectionQuery,
  TrendFilterQuery,
  TrendForecastQuery,
  TrendInsightQuery,
  TrendMetric,
  TrendPeriod,
  TrendResult,
  TrendSummary,
} from "./trends.types.js";

const calculateSummary = (data: TrendDataPoint[]): TrendSummary => {
  const values = data.map((d) => d.value);
  const total = values.reduce((sum, v) => sum + v, 0);
  const average = values.length > 0 ? total / values.length : 0;

  const first = values[0] ?? 0;
  const last = values[values.length - 1] ?? 0;
  const change = last - first;
  const changePercentage = first !== 0 ? (change / first) * 100 : 0;

  return {
    total,
    average: Math.round(average * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercentage: Math.round(changePercentage * 100) / 100,
  };
};

const getDateRange = (
  period: TrendPeriod,
  startDate?: string,
  endDate?: string,
) => {
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate
    ? new Date(startDate)
    : (() => {
        const d = new Date(end);
        switch (period) {
          case "day":
            d.setDate(d.getDate() - 30);
            break;
          case "week":
            d.setDate(d.getDate() - 12 * 7);
            break;
          case "month":
            d.setMonth(d.getMonth() - 12);
            break;
          case "quarter":
            d.setMonth(d.getMonth() - 12);
            break;
        }
        return d;
      })();

  return { start, end };
};

const getFeedbackCountTrend = async (
  workspaceId: string,
  period: TrendPeriod,
  startDate?: string,
  endDate?: string,
): Promise<TrendDataPoint[]> => {
  const { start, end } = getDateRange(period, startDate, endDate);

  const results = await prisma.$queryRaw<
    Array<{ date: string; count: bigint }>
  >`
    SELECT
      DATE_TRUNC(${period === "day" ? "day" : period === "week" ? "week" : period === "month" ? "month" : "quarter"}, "createdAt")::text AS date,
      COUNT(*)::bigint AS count
    FROM "Feedback"
    WHERE "workspaceId" = ${workspaceId}
      AND "createdAt" >= ${start}
      AND "createdAt" <= ${end}
    GROUP BY date
    ORDER BY date ASC
  `;

  return results.map((r) => ({
    date: r.date,
    value: Number(r.count),
  }));
};

const getSentimentDistributionTrend = async (
  workspaceId: string,
  period: TrendPeriod,
  startDate?: string,
  endDate?: string,
): Promise<TrendDataPoint[]> => {
  const { start, end } = getDateRange(period, startDate, endDate);

  const results = await prisma.$queryRaw<
    Array<{ date: string; sentiment: string; count: bigint }>
  >`
    SELECT
      DATE_TRUNC(${period === "day" ? "day" : period === "week" ? "week" : period === "month" ? "month" : "quarter"}, "createdAt")::text AS date,
      "sentiment",
      COUNT(*)::bigint AS count
    FROM "Feedback"
    WHERE "workspaceId" = ${workspaceId}
      AND "createdAt" >= ${start}
      AND "createdAt" <= ${end}
    GROUP BY date, "sentiment"
    ORDER BY date ASC
  `;

  const dateMap = new Map<string, number>();
  for (const r of results) {
    const existing = dateMap.get(r.date) ?? 0;
    const posWeight = r.sentiment === "POSITIVE" ? 1 : r.sentiment === "NEGATIVE" ? -1 : 0;
    dateMap.set(r.date, existing + posWeight * Number(r.count));
  }

  return Array.from(dateMap.entries()).map(([date, value]) => ({
    date,
    value,
  }));
};

const getCategoryDistributionTrend = async (
  workspaceId: string,
  period: TrendPeriod,
  startDate?: string,
  endDate?: string,
): Promise<TrendDataPoint[]> => {
  const { start, end } = getDateRange(period, startDate, endDate);

  const results = await prisma.$queryRaw<
    Array<{ date: string; count: bigint }>
  >`
    SELECT
      DATE_TRUNC(${period === "day" ? "day" : period === "week" ? "week" : period === "month" ? "month" : "quarter"}, "createdAt")::text AS date,
      COUNT(DISTINCT "category")::bigint AS count
    FROM "Feedback"
    WHERE "workspaceId" = ${workspaceId}
      AND "createdAt" >= ${start}
      AND "createdAt" <= ${end}
      AND "category" IS NOT NULL
    GROUP BY date
    ORDER BY date ASC
  `;

  return results.map((r) => ({
    date: r.date,
    value: Number(r.count),
  }));
};

const getSourceDistributionTrend = async (
  workspaceId: string,
  period: TrendPeriod,
  startDate?: string,
  endDate?: string,
): Promise<TrendDataPoint[]> => {
  const { start, end } = getDateRange(period, startDate, endDate);

  const results = await prisma.$queryRaw<
    Array<{ date: string; count: bigint }>
  >`
    SELECT
      DATE_TRUNC(${period === "day" ? "day" : period === "week" ? "week" : period === "month" ? "month" : "quarter"}, "createdAt")::text AS date,
      COUNT(DISTINCT "source")::bigint AS count
    FROM "Feedback"
    WHERE "workspaceId" = ${workspaceId}
      AND "createdAt" >= ${start}
      AND "createdAt" <= ${end}
    GROUP BY date
    ORDER BY date ASC
  `;

  return results.map((r) => ({
    date: r.date,
    value: Number(r.count),
  }));
};

const getAvgSentimentScoreTrend = async (
  workspaceId: string,
  period: TrendPeriod,
  startDate?: string,
  endDate?: string,
): Promise<TrendDataPoint[]> => {
  const { start, end } = getDateRange(period, startDate, endDate);

  const results = await prisma.$queryRaw<
    Array<{ date: string; avg_score: number }>
  >`
    SELECT
      DATE_TRUNC(${period === "day" ? "day" : period === "week" ? "week" : period === "month" ? "month" : "quarter"}, "createdAt")::text AS date,
      AVG(CASE
        WHEN "sentiment" = 'POSITIVE' THEN 1
        WHEN "sentiment" = 'NEUTRAL' THEN 0
        WHEN "sentiment" = 'NEGATIVE' THEN -1
        ELSE 0
      END) AS avg_score
    FROM "Feedback"
    WHERE "workspaceId" = ${workspaceId}
      AND "createdAt" >= ${start}
      AND "createdAt" <= ${end}
    GROUP BY date
    ORDER BY date ASC
  `;

  return results.map((r) => ({
    date: r.date,
    value: Math.round(r.avg_score * 100) / 100,
  }));
};

const fetchTrendData = async (
  workspaceId: string,
  metric: TrendMetric,
  period: TrendPeriod,
  startDate?: string,
  endDate?: string,
): Promise<TrendDataPoint[]> => {
  switch (metric) {
    case "feedback_count":
      return getFeedbackCountTrend(workspaceId, period, startDate, endDate);
    case "sentiment_distribution":
      return getSentimentDistributionTrend(
        workspaceId,
        period,
        startDate,
        endDate,
      );
    case "category_distribution":
      return getCategoryDistributionTrend(
        workspaceId,
        period,
        startDate,
        endDate,
      );
    case "source_distribution":
      return getSourceDistributionTrend(
        workspaceId,
        period,
        startDate,
        endDate,
      );
    case "avg_sentiment_score":
      return getAvgSentimentScoreTrend(
        workspaceId,
        period,
        startDate,
        endDate,
      );
    default:
      return [];
  }
};

export const trendsService = {
  async getTrends(
    actor: TrendActorContext,
    metric: TrendMetric,
    period: TrendPeriod,
    startDate?: string,
    endDate?: string,
  ): Promise<TrendResult> {
    assertCanViewTrends(actor.role);

    const data = await fetchTrendData(
      actor.workspaceId,
      metric,
      period,
      startDate,
      endDate,
    );

    return {
      metric,
      period,
      data,
      summary: calculateSummary(data),
    };
  },

  async getTrendsComparison(
    actor: TrendActorContext,
    metric: TrendMetric,
    currentPeriod: TrendPeriod,
    previousPeriod: TrendPeriod,
    startDate?: string,
    endDate?: string,
  ) {
    assertCanViewTrends(actor.role);

    const current = await this.getTrends(
      actor,
      metric,
      currentPeriod,
      startDate,
      endDate,
    );

    const previous = await this.getTrends(
      actor,
      metric,
      previousPeriod,
      startDate,
      endDate,
    );

    const absoluteChange = current.summary.total - previous.summary.total;
    const percentageChange =
      previous.summary.total !== 0
        ? (absoluteChange / previous.summary.total) * 100
        : 0;

    const direction =
      Math.abs(percentageChange) < 1
        ? "stable"
        : percentageChange > 0
          ? "up"
          : "down";

    return {
      current,
      previous,
      comparison: {
        absoluteChange: Math.round(absoluteChange * 100) / 100,
        percentageChange: Math.round(percentageChange * 100) / 100,
        direction,
      },
    };
  },

  async detectTrend(
    actor: TrendActorContext,
    query: TrendDetectionQuery,
  ) {
    assertCanDetectTrends(actor.role);

    const filterQuery: TrendFilterQuery = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      source: query.source,
      category: query.category,
    };

    return trendDetectionService.detectTrend(
      actor.workspaceId,
      query.metric,
      query.period,
      filterQuery,
    );
  },

  async detectAnomalies(
    actor: TrendActorContext,
    query: TrendAnomalyQuery,
  ) {
    assertCanDetectTrends(actor.role);

    const filterQuery: TrendFilterQuery = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    return trendDetectionService.detectAnomalies(
      actor.workspaceId,
      query.period,
      filterQuery,
    );
  },

  async generateForecast(
    actor: TrendActorContext,
    query: TrendForecastQuery,
  ) {
    assertCanDetectTrends(actor.role);

    const filterQuery: TrendFilterQuery = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    return trendDetectionService.generateForecast(
      actor.workspaceId,
      query.period,
      query.horizon ?? 7,
      filterQuery,
    );
  },

  async generateInsights(
    actor: TrendActorContext,
    query: TrendInsightQuery,
  ) {
    assertCanGenerateInsights(actor.role);

    const filterQuery: TrendFilterQuery = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      source: query.source,
      category: query.category,
    };

    return trendInsightService.generateInsights(
      actor.workspaceId,
      query.period,
      filterQuery,
    );
  },
};
