import {
  createAnalyticsCacheKey,
  getCachedAnalytics,
  setCachedAnalytics,
} from "./analytics.cache.js";
import {
  calculatePercentage,
  createTrendMap,
  mapDistribution,
} from "./analytics.helper.js";
import {
  mapOverview,
  mapSentimentDistribution,
  mapSourceDistribution,
  mapThemeDistribution,
} from "./analytics.mapper.js";
import { analyticsRepository } from "./analytics.repository.js";
import type {
  AnalyticsDashboard,
  AnalyticsInsight,
  AnalyticsQueryInput,
  HourlyDistributionItem,
} from "./analytics.types.js";

function hourly(rows: Array<{ createdAt: Date }>): HourlyDistributionItem[] {
  const counts = Array.from({ length: 24 }, () => 0);

  for (const row of rows) {
    const hour = row.createdAt.getHours();

    counts[hour] = (counts[hour] ?? 0) + 1;
  }

  return counts.map((count, hour) => ({
    hour,
    label: `${String(hour).padStart(2, "0")}:00`,
    count,
    percentage: calculatePercentage(count, rows.length),
  }));
}

function insights(
  total: number,
  positive: number,
  negative: number,
  topTheme?: string,
  topSource?: string,
): AnalyticsInsight[] {
  if (total === 0)
    return [
      {
        type: "INFO",
        title: "No feedback",
        description: "Change the selected date range or filters.",
      },
    ];
  const result: AnalyticsInsight[] = [];
  const positiveRate = calculatePercentage(positive, total);
  const negativeRate = calculatePercentage(negative, total);
  if (positiveRate >= 60)
    result.push({
      type: "POSITIVE",
      title: "Strong positive sentiment",
      description: `${positiveRate}% of feedback is positive.`,
      value: positiveRate,
    });
  if (negativeRate >= 25)
    result.push({
      type: "WARNING",
      title: "Negative feedback requires attention",
      description: `${negativeRate}% of feedback is negative.`,
      value: negativeRate,
    });
  if (topTheme)
    result.push({
      type: "INFO",
      title: "Most discussed theme",
      description: `${topTheme} is the most frequent theme.`,
    });
  if (topSource)
    result.push({
      type: "INFO",
      title: "Largest feedback source",
      description: `${topSource} generated the most feedback.`,
    });
  return result;
}

export const analyticsService = {
  async getOverview(input: AnalyticsQueryInput) {
    const key = createAnalyticsCacheKey(input.workspaceId, "overview", input);
    const cached = getCachedAnalytics<ReturnType<typeof mapOverview>>(key);
    if (cached) return cached;
    const result = mapOverview(await analyticsRepository.getOverview(input));
    setCachedAnalytics(key, result);
    return result;
  },

  async getTrend(input: AnalyticsQueryInput) {
    return createTrendMap(
      await analyticsRepository.getTrendRows(input),
      input.groupBy,
    );
  },

  async getSentimentDistribution(input: AnalyticsQueryInput) {
    const [overview, rows] = await Promise.all([
      this.getOverview(input),
      analyticsRepository.getSentimentDistribution(input),
    ]);
    return mapSentimentDistribution(rows, overview.totalFeedback);
  },

  async getSourceDistribution(input: AnalyticsQueryInput) {
    const [overview, rows] = await Promise.all([
      this.getOverview(input),
      analyticsRepository.getSourceDistribution(input),
    ]);
    return mapSourceDistribution(rows, overview.totalFeedback);
  },

  async getCategoryDistribution(input: AnalyticsQueryInput) {
    const [overview, rows] = await Promise.all([
      this.getOverview(input),
      analyticsRepository.getCategoryDistribution(input),
    ]);
    return mapDistribution(rows, overview.totalFeedback);
  },

  async getTopThemes(input: AnalyticsQueryInput) {
    const [overview, rows] = await Promise.all([
      this.getOverview(input),
      analyticsRepository.getTopThemes(input),
    ]);
    return mapThemeDistribution(rows, overview.totalFeedback);
  },

  async getHourlyDistribution(input: AnalyticsQueryInput) {
    return hourly(await analyticsRepository.getHourlyRows(input));
  },

  async getDashboard(input: AnalyticsQueryInput): Promise<AnalyticsDashboard> {
    const [
      overview,
      feedbackTrend,
      sentimentDistribution,
      sourceDistribution,
      categoryDistribution,
      topThemes,
      hourlyDistribution,
    ] = await Promise.all([
      this.getOverview(input),
      this.getTrend(input),
      this.getSentimentDistribution(input),
      this.getSourceDistribution(input),
      this.getCategoryDistribution(input),
      this.getTopThemes(input),
      this.getHourlyDistribution(input),
    ]);
    return {
      range: {
        startDate: input.startDate.toISOString(),
        endDate: input.endDate.toISOString(),
        groupBy: input.groupBy,
      },
      overview,
      feedbackTrend,
      sentimentDistribution,
      sourceDistribution,
      categoryDistribution,
      topThemes,
      hourlyDistribution,
      insights: insights(
        overview.totalFeedback,
        overview.positive.count,
        overview.negative.count,
        topThemes[0]?.name,
        sourceDistribution[0]?.label,
      ),
    };
  },

  exportAnalytics(input: AnalyticsQueryInput) {
    return analyticsRepository.getExportRows(input);
  },
};
