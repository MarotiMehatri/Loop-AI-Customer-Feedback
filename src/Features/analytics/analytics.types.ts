export type Sentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE";
export type FeedbackStatus = "NEW" | "REVIEWED" | "ACTIONED" | "ARCHIVED";
export type FeedbackChannel =
  | "SUPPORT"
  | "APP_STORE"
  | "SURVEY"
  | "SALES"
  | "SOCIAL"
  | "WEBSITE"
  | "EMAIL"
  | "MANUAL";

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

export interface AnalyticsInsight {
  type: "POSITIVE" | "WARNING" | "INFO";
  title: string;
  description: string;
  value?: number;
}

export interface AnalyticsDashboard {
  range: {
    startDate: string;
    endDate: string;
    groupBy: "day" | "week" | "month";
  };
  overview: AnalyticsOverview;
  feedbackTrend: TrendDataPoint[];
  sentimentDistribution: DistributionItem[];
  sourceDistribution: DistributionItem[];
  categoryDistribution: DistributionItem[];
  topThemes: ThemeAnalyticsItem[];
  hourlyDistribution: {
    hour: number;
    label: string;
    count: number;
    percentage: number;
  }[];
  insights: AnalyticsInsight[];
}

export interface InboxFeedback {
  id: string;
  content: string;
  source: FeedbackChannel;
  sentiment: Sentiment;
  status: FeedbackStatus;
  customerName: string | null;
  customerEmail: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  } | null;
}

export interface InboxSummary {
  totalFeedback: number;
  positive: { count: number; percentage: number };
  neutral: { count: number; percentage: number };
  negative: { count: number; percentage: number };
  unresolved: number;
}
