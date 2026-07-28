import { calculateGrowthRate, calculateSentimentScore, detectAnomalies } from "./trend.calculator.js";
import { TREND_ANOMALY_THRESHOLD } from "./trend.constants.js";
import { mapInsights } from "./trend.mapper.js";
import { trendRepository } from "./trend.repository.js";
import type { TrendFilterQuery, TrendInsight, TrendPeriod } from "./trends.types.js";

function aggregateByDate(
  rows: Array<{ createdAt: Date }>,
  period: TrendPeriod,
): Map<string, number> {
  const dateMap = new Map<string, number>();

  for (const row of rows) {
    const key = getDateKey(row.createdAt, period);
    dateMap.set(key, (dateMap.get(key) ?? 0) + 1);
  }

  return dateMap;
}

function getDateKey(date: Date, period: TrendPeriod): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  switch (period) {
    case "day":
      return `${year}-${month}-${day}`;
    case "week": {
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const wYear = weekStart.getFullYear();
      const wMonth = String(weekStart.getMonth() + 1).padStart(2, "0");
      const wDay = String(weekStart.getDate()).padStart(2, "0");
      return `${wYear}-${wMonth}-${wDay}`;
    }
    case "month":
      return `${year}-${month}`;
    case "quarter": {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `${year}-Q${quarter}`;
    }
  }
}

async function detectVolumeShiftInsight(
  workspaceId: string,
  query: TrendFilterQuery,
  period: TrendPeriod,
): Promise<TrendInsight | null> {
  const currentEnd = new Date(query.endDate ?? new Date());
  const currentStart = new Date(currentEnd);
  currentStart.setDate(currentStart.getDate() - 30);

  const previousEnd = new Date(currentStart);
  previousEnd.setDate(previousEnd.getDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - 30);

  const { currentCount, previousCount } = await trendRepository.getPeriodOverPeriod(
    workspaceId,
    currentStart,
    currentEnd,
    previousStart,
    previousEnd,
  );

  if (currentCount === 0 && previousCount === 0) return null;

  const growthRate = calculateGrowthRate(currentCount, previousCount);

  if (Math.abs(growthRate) < 10) return null;

  const direction = growthRate > 0 ? "increased" : "decreased";
  const type = growthRate > 0 ? "POSITIVE" : "WARNING";

  return {
    type,
    severity: Math.abs(growthRate) > 50 ? "high" : Math.abs(growthRate) > 25 ? "medium" : "low",
    title: `Feedback volume ${direction} significantly`,
    description: `Feedback volume ${direction} by ${Math.abs(growthRate)}% compared to the previous 30-day period.`,
    metric: "feedback_count",
    value: growthRate,
    recommendation:
      growthRate > 0
        ? "Investigate what's driving the increased feedback volume and ensure your team can handle the load."
        : "Review if feedback channels are working properly or if there's a drop in customer engagement.",
  };
}

async function detectSentimentShiftInsight(
  workspaceId: string,
  query: TrendFilterQuery,
): Promise<TrendInsight | null> {
  const currentEnd = new Date(query.endDate ?? new Date());
  const previousEnd = new Date(currentEnd);
  previousEnd.setDate(previousEnd.getDate() - 30);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - 30);

  const { currentCounts, previousCounts } =
    await trendRepository.getSentimentPeriodOverPeriod(
      workspaceId,
      previousEnd,
      currentEnd,
      previousStart,
      previousEnd,
    );

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
      severity: shift > 20 ? "high" : "medium",
      title: "Sentiment is improving",
      description: `Net sentiment score improved by ${shift.toFixed(1)} points (from ${previousScore.toFixed(1)} to ${currentScore.toFixed(1)}).`,
      metric: "sentiment_score",
      value: Number(shift.toFixed(1)),
      recommendation: "Continue the practices that are driving positive sentiment. Share success patterns across the team.",
    };
  }

  return {
    type: "WARNING",
    severity: Math.abs(shift) > 20 ? "high" : "medium",
    title: "Sentiment is declining",
    description: `Net sentiment score dropped by ${Math.abs(shift).toFixed(1)} points (from ${previousScore.toFixed(1)} to ${currentScore.toFixed(1)}).`,
    metric: "sentiment_score",
    value: Number(shift.toFixed(1)),
    recommendation: "Investigate recent changes that may be causing negative sentiment. Prioritize addressing top customer complaints.",
  };
}

async function detectVolumeAnomalyInsight(
  workspaceId: string,
  query: TrendFilterQuery,
  period: TrendPeriod,
): Promise<TrendInsight | null> {
  const rows = await trendRepository.getFeedbackCountByDate(workspaceId, query);

  if (rows.length < 10) return null;

  const dateMap = aggregateByDate(rows, period);
  const dataPoints = Array.from(dateMap.entries())
    .map(([date, value]) => ({ date, value: Number(value) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const anomalies = detectAnomalies(dataPoints, TREND_ANOMALY_THRESHOLD);

  if (anomalies.length === 0) return null;

  const latest = anomalies[anomalies.length - 1];
  if (!latest) return null;

  return {
    type: latest.type === "SPIKE" ? "WARNING" : "INFO",
    severity: latest.type === "SPIKE" ? "high" : "low",
    title: latest.type === "SPIKE" ? "Unusual volume spike detected" : "Unusual volume drop detected",
    description: `Period ${latest.date} had ${latest.value} feedback entries, which is significantly ${latest.type === "SPIKE" ? "higher" : "lower"} than normal.`,
    metric: "feedback_count",
    value: latest.value,
    recommendation:
      latest.type === "SPIKE"
        ? "Investigate the cause of the sudden spike in feedback volume. Check for product releases, marketing campaigns, or service issues."
        : "Verify that all feedback channels are operational and collecting data correctly.",
  };
}

async function detectTopNegativeCategoryInsight(
  workspaceId: string,
  query: TrendFilterQuery,
): Promise<TrendInsight | null> {
  const rows = await trendRepository.getCategoryDistribution(workspaceId, {
    ...query,
    sentiment: "NEGATIVE",
  });

  if (rows.length === 0) return null;

  const top = rows[0];
  if (!top || top._count.category < 5) return null;

  return {
    type: "WARNING",
    severity: top._count.category > 20 ? "high" : "medium",
    title: "Top negative feedback category",
    description: `"${top.category}" has the most negative feedback with ${top._count.category} entries. Consider prioritizing improvements here.`,
    metric: "category_distribution",
    value: top._count.category,
    recommendation: "Review recent changes related to this category. Schedule a focused improvement session to address root causes.",
  };
}

async function detectSourceConcentrationInsight(
  workspaceId: string,
  query: TrendFilterQuery,
): Promise<TrendInsight | null> {
  const rows = await trendRepository.getSourceDistribution(workspaceId, query);

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
    severity: concentration > 80 ? "medium" : "low",
    title: "Feedback source concentration",
    description: `${sourceLabels[top.source] ?? top.source} accounts for ${concentration.toFixed(0)}% of all feedback. Consider diversifying feedback channels.`,
    metric: "source_distribution",
    value: Number(concentration.toFixed(1)),
    recommendation: "Explore adding or promoting alternative feedback channels to get a more balanced view of customer sentiment.",
  };
}

export const trendInsightService = {
  async generateInsights(
    workspaceId: string,
    period: TrendPeriod,
    query: TrendFilterQuery,
  ): Promise<TrendInsight[]> {
    const [volumeShift, sentimentShift, volumeAnomaly, topCategory, sourceConcentration] =
      await Promise.all([
        detectVolumeShiftInsight(workspaceId, query, period),
        detectSentimentShiftInsight(workspaceId, query),
        detectVolumeAnomalyInsight(workspaceId, query, period),
        detectTopNegativeCategoryInsight(workspaceId, query),
        detectSourceConcentrationInsight(workspaceId, query),
      ]);

    const insights: TrendInsight[] = [];

    if (volumeShift) insights.push(volumeShift);
    if (sentimentShift) insights.push(sentimentShift);
    if (volumeAnomaly) insights.push(volumeAnomaly);
    if (topCategory) insights.push(topCategory);
    if (sourceConcentration) insights.push(sourceConcentration);

    return insights;
  },
};
