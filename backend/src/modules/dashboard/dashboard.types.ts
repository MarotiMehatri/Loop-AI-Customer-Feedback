import type {
  FeedbackChannel,
  FeedbackStatus,
  Role,
  Sentiment,
} from "../../generated/prisma/client.js";

export type DashboardRange = "7d" | "30d" | "90d" | "custom";

export type DashboardTrend = "UP" | "DOWN" | "FLAT";

export interface DashboardContext {
  userId: string;
  workspaceId: string;
  role: Role;
}

export interface DashboardQuery {
  range: DashboardRange;
  startDate?: Date;
  endDate?: Date;
  recentLimit: number;
  topThemesLimit: number;
}

export interface DashboardPeriod {
  range: DashboardRange;
  startDate: Date;
  endDate: Date;
  previousStartDate: Date;
  previousEndDate: Date;
}

export interface DashboardMetric {
  value: number;
  previousValue: number;
  changePercentage: number;
  trend: DashboardTrend;
}

export interface DashboardTopThemeSummary {
  id: string | null;
  name: string | null;
  color: string | null;
  feedbackCount: number;
  percentage: number;
}

export interface DashboardSummary {
  totalFeedback: DashboardMetric;
  negativeFeedback: DashboardMetric;
  newFeedback: DashboardMetric;
  activeUsers: DashboardMetric;
  topTheme: DashboardTopThemeSummary;
}

export interface FeedbackTrendPoint {
  date: string;
  label: string;
  count: number;
}

export interface SentimentDistributionItem {
  sentiment: Sentiment;
  label: string;
  count: number;
  percentage: number;
}

export interface SourceDistributionItem {
  source: FeedbackChannel;
  label: string;
  count: number;
  percentage: number;
}

export interface SentimentTrendPoint {
  date: string;
  label: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export interface TopThemeItem {
  id: string;
  name: string;
  color: string | null;
  feedbackCount: number;
  percentage: number;
}

export interface RecentFeedbackItem {
  id: string;
  content: string;
  sentiment: Sentiment;
  sentimentLabel: string;
  source: FeedbackChannel;
  sourceLabel: string;
  status: FeedbackStatus;
  createdAt: Date;
  customerName: string | null;
  avatarUrl: string | null;
}

export type DashboardQuickActionKey =
  "ADD_FEEDBACK" | "UPLOAD_CSV" | "ASK_LOOP" | "VIEW_REPORTS";

export interface DashboardQuickAction {
  key: DashboardQuickActionKey;
  label: string;
  description: string;
  route: string;
}

export interface DashboardCharts {
  feedbackOverTime: FeedbackTrendPoint[];
  sentimentDistribution: SentimentDistributionItem[];
  sourceDistribution: SourceDistributionItem[];
  sentimentOverTime: SentimentTrendPoint[];
}

export interface DashboardResponse {
  period: DashboardPeriod;
  summary: DashboardSummary;
  charts: DashboardCharts;
  topThemes: TopThemeItem[];
  recentFeedback: RecentFeedbackItem[];
  quickActions: DashboardQuickAction[];
  generatedAt: Date;
}

export interface DashboardFeedbackRecord {
  id: string;
  content: string;
  sentiment: Sentiment;
  source: FeedbackChannel;
  status: FeedbackStatus;
  createdAt: Date;
}

export interface DashboardThemeLinkRecord {
  feedbackId: string;
  theme: {
    id: string;
    name: string;
    color: string | null;
  };
}
