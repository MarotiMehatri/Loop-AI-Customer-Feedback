import type { Prisma } from "../../generated/prisma/client.js";

import { prisma } from "../../config/prisma.js";

import {
  calculateGrowthRate,
  calculateSentimentScore,
  calculateMovingAverage,
  detectAnomalies,
  calculateVolatility,
  calculateWeekOverWeekChange,
  calculatePeakHour,
} from "./analytics.calculator.js";

import { buildFeedbackWhere } from "./analytics.query.js";

import type {
  AnalyticsGroupBy,
  AnalyticsInsight,
  AnalyticsQueryInput,
  TrendDataPoint,
} from "./analytics.types.js";

import { createTrendMap } from "./analytics.helper.js";

async function detectTrendShift(
  input: AnalyticsQueryInput,
): Promise<AnalyticsInsight | null> {
  const currentEnd = new Date(input.endDate);
  const currentStart = new Date(currentEnd);
  currentStart.setDate(currentStart.getDate() - 30);

  const previousEnd = new Date(currentStart);
  previousEnd.setDate(previousEnd.getDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - 30);

  const [currentRows, previousRows] = await Promise.all([
    prisma.feedback.findMany({
      where: {
        ...buildFeedbackWhere(input),
        createdAt: { gte: currentStart, lte: currentEnd },
      },
      select: { createdAt: true, sentiment: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.feedback.findMany({
      where: {
        workspaceId: input.workspaceId,
        createdAt: { gte: previousStart, lte: previousEnd },
      },
      select: { createdAt: true, sentiment: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  if (currentRows.length === 0 && previousRows.length === 0) return null;

  const currentTrend = createTrendMap(currentRows, "day");
  const previousTrend = createTrendMap(previousRows, "day");

  const currentTotal = currentRows.length;
  const previousTotal = previousRows.length;

  const growthRate = calculateGrowthRate(currentTotal, previousTotal);

  if (Math.abs(growthRate) < 10) return null;

  const direction = growthRate > 0 ? "increased" : "decreased";
  const type = growthRate > 0 ? "POSITIVE" : "WARNING";

  return {
    type,
    title: `Feedback volume ${direction} significantly`,
    description: `Feedback volume ${direction} by ${Math.abs(growthRate)}% compared to the previous 30-day period.`,
    value: growthRate,
  };
}

async function detectSentimentShift(
  input: AnalyticsQueryInput,
): Promise<AnalyticsInsight | null> {
  const currentEnd = new Date(input.endDate);
  const previousEnd = new Date(currentEnd);
  previousEnd.setDate(previousEnd.getDate() - 30);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - 30);

  const [currentCounts, previousCounts] = await Promise.all([
    prisma.feedback.groupBy({
      by: ["sentiment"],
      where: {
        ...buildFeedbackWhere(input),
        createdAt: { gte: previousEnd, lte: currentEnd },
      },
      _count: { sentiment: true },
    }),
    prisma.feedback.groupBy({
      by: ["sentiment"],
      where: {
        workspaceId: input.workspaceId,
        createdAt: { gte: previousStart, lte: previousEnd },
      },
      _count: { sentiment: true },
    }),
  ]);

  const getCount = (
    counts: Array<{ sentiment: string; _count: { sentiment: number } }>,
    sentiment: string,
  ) => counts.find((c) => c.sentiment === sentiment)?._count.sentiment ?? 0;

  const currentScore = calculateSentimentScore(
    getCount(currentCounts, "POSITIVE"),
    getCount(currentCounts, "NEUTRAL"),
    getCount(currentCounts, "NEGATIVE"),
  );

  const previousScore = calculateSentimentScore(
    getCount(previousCounts, "POSITIVE"),
    getCount(previousCounts, "NEUTRAL"),
    getCount(previousCounts, "NEGATIVE"),
  );

  const shift = currentScore - previousScore;

  if (Math.abs(shift) < 5) return null;

  if (shift > 0) {
    return {
      type: "POSITIVE",
      title: "Sentiment is improving",
      description: `Net sentiment score improved by ${shift} points (from ${previousScore} to ${currentScore}).`,
      value: shift,
    };
  }

  return {
    type: "WARNING",
    title: "Sentiment is declining",
    description: `Net sentiment score dropped by ${Math.abs(shift)} points (from ${previousScore} to ${currentScore}).`,
    value: shift,
  };
}

async function detectVolumeAnomaly(
  input: AnalyticsQueryInput,
): Promise<AnalyticsInsight | null> {
  const rows = await prisma.feedback.findMany({
    where: buildFeedbackWhere(input),
    select: { createdAt: true, sentiment: true },
    orderBy: { createdAt: "asc" },
  });

  if (rows.length < 10) return null;

  const trendPoints = createTrendMap(rows, input.groupBy);
  const anomalies = detectAnomalies(trendPoints);

  if (anomalies.length === 0) return null;

  const latest = anomalies[anomalies.length - 1];
  if (!latest) return null;

  return {
    type: latest.type === "SPIKE" ? "WARNING" : "INFO",
    title: latest.type === "SPIKE" ? "Unusual volume spike detected" : "Unusual volume drop detected",
    description: `Period ${latest.period} had ${latest.value} feedback entries, which is significantly ${latest.type === "SPIKE" ? "higher" : "lower"} than normal.`,
    value: latest.value,
  };
}

async function detectTopComplaint(
  input: AnalyticsQueryInput,
): Promise<AnalyticsInsight | null> {
  const negativeRows = await prisma.feedback.groupBy({
    by: ["category"],
    where: {
      ...buildFeedbackWhere(input),
      sentiment: "NEGATIVE",
      category: { not: null },
    },
    _count: { category: true },
    orderBy: { _count: { category: "desc" } },
    take: 1,
  });

  if (negativeRows.length === 0) return null;

  const top = negativeRows[0];
  if (!top || top._count.category < 5) return null;

  return {
    type: "WARNING",
    title: "Top negative feedback category",
    description: `"${top.category}" has the most negative feedback with ${top._count.category} entries. Consider prioritizing improvements here.`,
    value: top._count.category,
  };
}

async function detectSourceConcentration(
  input: AnalyticsQueryInput,
): Promise<AnalyticsInsight | null> {
  const rows = await prisma.feedback.groupBy({
    by: ["source"],
    where: buildFeedbackWhere(input),
    _count: { source: true },
    orderBy: { _count: { source: "desc" } },
  });

  if (rows.length === 0) return null;

  const total = rows.reduce((sum, r) => sum + r._count.source, 0);
  const top = rows[0];
  if (!top) return null;

  const concentration = (top._count.source / total) * 100;

  if (concentration < 50) return null;

  const sourceLabels: Record<string, string> = {
    SUPPORT: "Support",
    APP_STORE: "App Store",
    SURVEY: "Survey",
    SALES: "Sales",
    SOCIAL: "Social",
    WEBSITE: "Website",
    EMAIL: "Email",
    MANUAL: "Manual",
  };

  return {
    type: "INFO",
    title: "Feedback source concentration",
    description: `${sourceLabels[top.source] ?? top.source} accounts for ${concentration.toFixed(0)}% of all feedback. Consider diversifying feedback channels.`,
    value: Number(concentration.toFixed(1)),
  };
}

export const analyticsInsightService = {
  async generateInsights(
    input: AnalyticsQueryInput,
    trendPoints: TrendDataPoint[],
  ): Promise<AnalyticsInsight[]> {
    const [
      trendShiftInsight,
      sentimentShiftInsight,
      volumeAnomalyInsight,
      topComplaintInsight,
      sourceConcentrationInsight,
    ] = await Promise.all([
      detectTrendShift(input),
      detectSentimentShift(input),
      detectVolumeAnomaly(input),
      detectTopComplaint(input),
      detectSourceConcentration(input),
    ]);

    const insights: AnalyticsInsight[] = [];

    if (trendShiftInsight) insights.push(trendShiftInsight);
    if (sentimentShiftInsight) insights.push(sentimentShiftInsight);
    if (volumeAnomalyInsight) insights.push(volumeAnomalyInsight);
    if (topComplaintInsight) insights.push(topComplaintInsight);
    if (sourceConcentrationInsight) insights.push(sourceConcentrationInsight);

    return insights;
  },

  async getTrendAnalytics(input: AnalyticsQueryInput) {
    const rows = await prisma.feedback.findMany({
      where: buildFeedbackWhere(input),
      select: { createdAt: true, sentiment: true },
      orderBy: { createdAt: "asc" },
    });

    const trendPoints = createTrendMap(rows, input.groupBy);
    const totals = trendPoints.map((p) => p.total);

    return {
      trendPoints,
      movingAverage: calculateMovingAverage(totals, 7),
      volatility: calculateVolatility(totals),
      anomalies: detectAnomalies(trendPoints),
    };
  },

  async getHourlyAnalytics(input: AnalyticsQueryInput) {
    const rows = await prisma.feedback.findMany({
      where: buildFeedbackWhere(input),
      select: { createdAt: true },
    });

    const hourlyCounts = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: 0,
    }));

    for (const row of rows) {
      const hour = row.createdAt.getHours();
      const entry = hourlyCounts[hour];
      if (entry) entry.count++;
    }

    return {
      hourlyData: hourlyCounts,
      peakHour: calculatePeakHour(hourlyCounts),
    };
  },

  async getWeekOverWeekComparison(input: AnalyticsQueryInput) {
    const now = new Date(input.endDate);
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);

    const [currentCount, previousCount] = await Promise.all([
      prisma.feedback.count({
        where: {
          ...buildFeedbackWhere(input),
          createdAt: { gte: currentWeekStart, lte: now },
        },
      }),
      prisma.feedback.count({
        where: {
          workspaceId: input.workspaceId,
          createdAt: { gte: previousWeekStart, lte: currentWeekStart },
        },
      }),
    ]);

    return {
      currentWeek: currentCount,
      previousWeek: previousCount,
      ...calculateWeekOverWeekChange(currentCount, previousCount),
    };
  },
};
