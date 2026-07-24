import { SENTIMENT_LABELS, SOURCE_LABELS } from "./analytics.constants.js";
import { calculatePercentage, mapDistribution } from "./analytics.helper.js";
import type {
  AnalyticsOverview,
  ThemeAnalyticsItem,
} from "./analytics.types.js";

export function mapOverview(input: {
  totalFeedback: number;
  positive: number;
  neutral: number;
  negative: number;
  unresolved: number;
  topTheme: { id: string; name: string; count: number } | null;
}): AnalyticsOverview {
  return {
    totalFeedback: input.totalFeedback,
    positive: {
      count: input.positive,
      percentage: calculatePercentage(input.positive, input.totalFeedback),
    },
    neutral: {
      count: input.neutral,
      percentage: calculatePercentage(input.neutral, input.totalFeedback),
    },
    negative: {
      count: input.negative,
      percentage: calculatePercentage(input.negative, input.totalFeedback),
    },
    unresolved: input.unresolved,
    topTheme: input.topTheme
      ? {
          ...input.topTheme,
          percentage: calculatePercentage(
            input.topTheme.count,
            input.totalFeedback,
          ),
        }
      : null,
  };
}

export const mapSentimentDistribution = (
  rows: Array<{ key: string; count: number }>,
  total: number,
) => mapDistribution(rows, total, SENTIMENT_LABELS);
export const mapSourceDistribution = (
  rows: Array<{ key: string; count: number }>,
  total: number,
) => mapDistribution(rows, total, SOURCE_LABELS);
export const mapThemeDistribution = (
  rows: Array<{ id: string; name: string; count: number }>,
  total: number,
): ThemeAnalyticsItem[] =>
  rows.map((row) => ({
    ...row,
    percentage: calculatePercentage(row.count, total),
  }));
