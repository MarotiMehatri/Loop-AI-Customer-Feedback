import { percentage, toDayKey } from "./theme.helper.js";

import { mapTheme } from "./theme.mapper.js";

import { themeRepository } from "./theme.repository.js";

import type {
  ThemeAnalyticsResponse,
  ThemeSentimentItem,
  ThemeTrendItem,
} from "./theme.types.js";

export async function getThemeAnalytics(
  themeId: string,
  workspaceId: string,
): Promise<ThemeAnalyticsResponse | null> {
  const theme = await themeRepository.findById(themeId, workspaceId);

  if (!theme) {
    return null;
  }

  const records = await themeRepository.getAnalyticsRecords(
    themeId,
    workspaceId,
  );

  const sentimentCounts = new Map<string, number>();

  const trendCounts = new Map<string, number>();

  let confidenceTotal = 0;

  for (const record of records) {
    const sentiment = String(record.feedback.sentiment);

    sentimentCounts.set(sentiment, (sentimentCounts.get(sentiment) ?? 0) + 1);

    const period = toDayKey(record.feedback.createdAt);

    trendCounts.set(period, (trendCounts.get(period) ?? 0) + 1);

    confidenceTotal += Number(record.confidence ?? 0);
  }

  const totalFeedback = records.length;

  const sentiment: ThemeSentimentItem[] = [...sentimentCounts.entries()]
    .map(([name, count]) => ({
      sentiment: name,
      count,
      percentage: percentage(count, totalFeedback),
    }))
    .sort((first, second) => second.count - first.count);

  const trend: ThemeTrendItem[] = [...trendCounts.entries()]
    .map(([period, count]) => ({
      period,
      count,
    }))
    .sort((first, second) => first.period.localeCompare(second.period));

  return {
    theme: mapTheme(theme),
    totalFeedback,
    averageConfidence:
      totalFeedback > 0
        ? Number((confidenceTotal / totalFeedback).toFixed(4))
        : 0,
    sentiment,
    trend,
  };
}
