import type {
  FeedbackChannel,
  FeedbackStatus,
  Sentiment,
} from "../../generated/prisma/client.js";

export type AnalyticsGroupBy = "day" | "week" | "month";

export interface AnalyticsQueryInput {
  workspaceId: string;
  startDate: Date;
  endDate: Date;
  groupBy: AnalyticsGroupBy;
  source?: FeedbackChannel;
  sentiment?: Sentiment;
  status?: FeedbackStatus;
  category?: string;
  themeId?: string;
}

export interface OverviewMetric {
  count: number;
  percentage: number;
}
export interface AnalyticsOverview {
  totalFeedback: number;
  positive: OverviewMetric;
  neutral: OverviewMetric;
  negative: OverviewMetric;
  unresolved: number;
  topTheme: {
    id: string;
    name: string;
    count: number;
    percentage: number;
  } | null;
}

export interface TrendDataPoint {
  period: string;
  total: number;
  positive: number;
  neutral: number;
  negative: number;
}

export interface DistributionItem {
  key: string;
  label: string;
  count: number;
  percentage: number;
}

export interface ThemeAnalyticsItem {
  id: string;
  name: string;
  count: number;
  percentage: number;
}

export interface HourlyDistributionItem {
  hour: number;
  label: string;
  count: number;
  percentage: number;
}

export interface AnalyticsInsight {
  type: "POSITIVE" | "WARNING" | "INFO";
  title: string;
  description: string;
  value?: number;
}

export interface AnalyticsDashboard {
  range: { startDate: string; endDate: string; groupBy: AnalyticsGroupBy };
  overview: AnalyticsOverview;
  feedbackTrend: TrendDataPoint[];
  sentimentDistribution: DistributionItem[];
  sourceDistribution: DistributionItem[];
  categoryDistribution: DistributionItem[];
  topThemes: ThemeAnalyticsItem[];
  hourlyDistribution: HourlyDistributionItem[];
  insights: AnalyticsInsight[];
}

export interface AnalyticsCacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface LiveUrlPayload {
  workspaceId: string;
  userId: string;
  filters?: Partial<AnalyticsQueryInput>;
  expiresAt: number;
  createdAt: number;
}

export interface CreateLiveUrlInput {
  expiresInHours?: number;
  filters?: {
    source?: FeedbackChannel;
    sentiment?: Sentiment;
    status?: FeedbackStatus;
    category?: string;
    themeId?: string;
  };
}

export interface LiveUrlInfo {
  token: string;
  url: string;
  expiresAt: string;
  createdAt: string;
  filters?: CreateLiveUrlInput["filters"];
}

export interface LiveUrlStats {
  accessCount: number;
  lastAccessedAt: string | null;
}

