import { Sentiment } from "../../generated/prisma/client.js";

import {
  DASHBOARD_SENTIMENT_LABELS,
  DASHBOARD_SOURCE_LABELS,
} from "./dashboard.constants.js";

import {
  createDailyDateKeys,
  formatDashboardDateLabel,
  toUtcDateKey,
} from "./dashboard.query.js";

import type {
  DashboardFeedbackRecord,
  DashboardMetric,
  DashboardThemeLinkRecord,
  FeedbackTrendPoint,
  RecentFeedbackItem,
  SentimentDistributionItem,
  SentimentTrendPoint,
  SourceDistributionItem,
  TopThemeItem,
} from "./dashboard.types.js";

function round(value: number, decimals = 1): number {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

export function calculatePercentage(value: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return round((value / total) * 100);
}

export function calculateMetric(
  currentValue: number,
  previousValue: number,
): DashboardMetric {
  let changePercentage = 0;

  if (previousValue > 0) {
    changePercentage = round(
      ((currentValue - previousValue) / previousValue) * 100,
    );
  } else if (currentValue > 0) {
    changePercentage = 100;
  }

  return {
    value: round(currentValue),
    previousValue: round(previousValue),
    changePercentage,
    trend: changePercentage > 0 ? "UP" : changePercentage < 0 ? "DOWN" : "FLAT",
  };
}

function getSentimentLabel(sentiment: string): string {
  return (
    DASHBOARD_SENTIMENT_LABELS[
      sentiment as keyof typeof DASHBOARD_SENTIMENT_LABELS
    ] ?? sentiment
  );
}

function getSourceLabel(source: string): string {
  return (
    DASHBOARD_SOURCE_LABELS[source as keyof typeof DASHBOARD_SOURCE_LABELS] ??
    source
  );
}

export function buildFeedbackOverTime(
  feedback: DashboardFeedbackRecord[],
  startDate: Date,
  endDate: Date,
): FeedbackTrendPoint[] {
  const counts = new Map<string, number>();

  for (const item of feedback) {
    const key = toUtcDateKey(item.createdAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return createDailyDateKeys(startDate, endDate).map((date) => ({
    date,
    label: formatDashboardDateLabel(date),
    count: counts.get(date) ?? 0,
  }));
}

export function buildSentimentDistribution(
  feedback: DashboardFeedbackRecord[],
): SentimentDistributionItem[] {
  const counts = new Map<string, number>();

  for (const item of feedback) {
    const key = String(item.sentiment);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const order = [Sentiment.POSITIVE, Sentiment.NEUTRAL, Sentiment.NEGATIVE];

  return order.map((sentiment) => {
    const count = counts.get(sentiment) ?? 0;

    return {
      sentiment,
      label: getSentimentLabel(sentiment),
      count,
      percentage: calculatePercentage(count, feedback.length),
    };
  });
}

export function buildSourceDistribution(
  feedback: DashboardFeedbackRecord[],
): SourceDistributionItem[] {
  const counts = new Map<string, number>();

  for (const item of feedback) {
    const key = String(item.source);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([source, count]) => ({
      source: source as DashboardFeedbackRecord["source"],
      label: getSourceLabel(source),
      count,
      percentage: calculatePercentage(count, feedback.length),
    }))
    .sort((first, second) =>
      second.count !== first.count
        ? second.count - first.count
        : first.label.localeCompare(second.label),
    );
}

export function buildSentimentOverTime(
  feedback: DashboardFeedbackRecord[],
  startDate: Date,
  endDate: Date,
): SentimentTrendPoint[] {
  const data = new Map<
    string,
    {
      positive: number;
      neutral: number;
      negative: number;
    }
  >();

  for (const item of feedback) {
    const date = toUtcDateKey(item.createdAt);
    const current = data.get(date) ?? {
      positive: 0,
      neutral: 0,
      negative: 0,
    };

    if (item.sentiment === Sentiment.POSITIVE) {
      current.positive += 1;
    } else if (item.sentiment === Sentiment.NEUTRAL) {
      current.neutral += 1;
    } else if (item.sentiment === Sentiment.NEGATIVE) {
      current.negative += 1;
    }

    data.set(date, current);
  }

  return createDailyDateKeys(startDate, endDate).map((date) => {
    const counts = data.get(date) ?? {
      positive: 0,
      neutral: 0,
      negative: 0,
    };

    return {
      date,
      label: formatDashboardDateLabel(date),
      positive: counts.positive,
      neutral: counts.neutral,
      negative: counts.negative,
      total: counts.positive + counts.neutral + counts.negative,
    };
  });
}

export function buildTopThemes(
  links: DashboardThemeLinkRecord[],
  totalFeedback: number,
  limit: number,
): TopThemeItem[] {
  const groups = new Map<
    string,
    {
      id: string;
      name: string;
      color: string | null;
      feedbackIds: Set<string>;
    }
  >();

  for (const link of links) {
    const current = groups.get(link.theme.id) ?? {
      id: link.theme.id,
      name: link.theme.name,
      color: link.theme.color,
      feedbackIds: new Set<string>(),
    };

    current.feedbackIds.add(link.feedbackId);
    groups.set(link.theme.id, current);
  }

  return [...groups.values()]
    .map((item) => ({
      id: item.id,
      name: item.name,
      color: item.color,
      feedbackCount: item.feedbackIds.size,
      percentage: calculatePercentage(item.feedbackIds.size, totalFeedback),
    }))
    .sort((first, second) =>
      second.feedbackCount !== first.feedbackCount
        ? second.feedbackCount - first.feedbackCount
        : first.name.localeCompare(second.name),
    )
    .slice(0, limit);
}

export function mapRecentFeedback(
  feedback: DashboardFeedbackRecord[],
  limit: number,
): RecentFeedbackItem[] {
  return [...feedback]
    .sort(
      (first, second) => second.createdAt.getTime() - first.createdAt.getTime(),
    )
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      content: item.content,
      sentiment: item.sentiment,
      sentimentLabel: getSentimentLabel(String(item.sentiment)),
      source: item.source,
      sourceLabel: getSourceLabel(String(item.source)),
      status: item.status,
      createdAt: item.createdAt,
      customerName: null,
      avatarUrl: null,
    }));
}
