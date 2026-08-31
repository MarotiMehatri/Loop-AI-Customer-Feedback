export type AnalyticsInsightType = "POSITIVE" | "WARNING" | "INFO";

export interface AnalyticsInsight {
  id: string;
  type: AnalyticsInsightType;
  title: string;
  description: string;
  createdAt: string;
}

export interface AnalyticsTrendPoint {
  period: string;
  total: number;
  positive: number;
  neutral: number;
  negative: number;
}

export interface AnalyticsDistribution {
  key: string;
  label: string;
  count: number;
  percentage: number;
}

export interface AnalyticsTheme {
  id: string;
  name: string;
  count: number;
  percentage: number;
  avgConfidence: number;
}

export interface AnalyticsDashboard {
  range: { startDate: string; endDate: string; days: number };
  overview: {
    totalFeedback: number;
    newFeedback: number;
    negativeFeedback: number;
    positiveFeedback: number;
    pendingReview: number;
    aiClassified: number;
    unresolved: number;
    positive: { count: number; percentage: number };
    neutral: { count: number; percentage: number };
    negative: { count: number; percentage: number };
  };
  changes: {
    total: number;
    newFeedback: number;
    negative: number;
    positive: number;
    pendingReview: number;
    aiClassified: number;
  };
  feedbackTrend: AnalyticsTrendPoint[];
  sourceDistribution: AnalyticsDistribution[];
  categoryDistribution: AnalyticsDistribution[];
  topThemes: AnalyticsTheme[];
  themeTrend: Array<{ period: string; values: Record<string, number> }>;
  statusDistribution: AnalyticsDistribution[];
  insights: AnalyticsInsight[];
  workspaceName: string;
}
