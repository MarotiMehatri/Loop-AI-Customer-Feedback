import type {
  ReportStatus,
  ReportType as PrismaReportType,
} from "../../generated/prisma/client.js";

export const REPORT_TYPES = [
  "VOICE_OF_CUSTOMER",
  "INSIGHTS",
  "ANALYTICS",
  "SUMMARY",
  "SENTIMENT",
  "THEMES",
  "CUSTOM",
] as const;

export const REPORT_SOURCES = [
  "SUPPORT",
  "APP_STORE",
  "SURVEY",
  "SALES",
  "SOCIAL",
  "WEBSITE",
  "EMAIL",
  "MANUAL",
] as const;

export const REPORT_METRICS = [
  "TOTAL_FEEDBACK",
  "POSITIVE_FEEDBACK",
  "NEGATIVE_FEEDBACK",
  "NEUTRAL_FEEDBACK",
  "SENTIMENT_DISTRIBUTION",
  "TOP_THEMES",
  "FEEDBACK_TREND",
  "RESPONSE_RATE",
  "CHANNEL_DISTRIBUTION",
] as const;

export const REPORT_CHART_TYPES = [
  "LINE",
  "BAR",
  "PIE",
  "DONUT",
  "AREA",
  "TABLE",
] as const;

export const REPORT_EXPORT_FORMATS = ["CSV", "JSON"] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export type ReportSource = (typeof REPORT_SOURCES)[number];

export type ReportMetric = (typeof REPORT_METRICS)[number];

export type ReportChartType = (typeof REPORT_CHART_TYPES)[number];

export type ReportExportFormat = (typeof REPORT_EXPORT_FORMATS)[number];

export interface ReportFilters {
  sentiments?: string[];
  channels?: string[];
  statuses?: string[];
  themeIds?: string[];
  search?: string;
}

export interface ReportChartConfiguration {
  type: ReportChartType;
  metric: ReportMetric;
  title?: string;
}

export interface CreateReportInput {
  title: string;
  description?: string;
  type: ReportType;
  startDate?: Date;
  endDate?: Date;
  sources: ReportSource[];
  filters?: ReportFilters;
  metrics: ReportMetric[];
  charts?: ReportChartConfiguration[];
  tags?: string[];
  saveAsTemplate?: boolean;
}

export interface UpdateReportInput {
  title?: string;
  description?: string | null;
  type?: ReportType;
  status?: ReportStatus;
  startDate?: Date | null;
  endDate?: Date | null;
  sources?: ReportSource[];
  filters?: ReportFilters;
  metrics?: ReportMetric[];
  charts?: ReportChartConfiguration[];
  tags?: string[];
  scheduledAt?: Date | null;
}

export interface ReportListQuery {
  page: number;
  limit: number;
  search?: string;
  type?: PrismaReportType;
  status?: ReportStatus;
  startDate?: Date;
  endDate?: Date;
  sortBy: "createdAt" | "updatedAt" | "title" | "status";
  sortOrder: "asc" | "desc";
}

export interface ReportPreviewInput {
  startDate?: Date;
  endDate?: Date;
  sources: ReportSource[];
  filters?: ReportFilters;
  metrics: ReportMetric[];
  charts?: ReportChartConfiguration[];
}

export interface ReportPreview {
  totalFeedback: number;
  positive: number;
  neutral: number;
  negative: number;
  responseRate: number;
  sentimentDistribution: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  channelDistribution: Array<{
    name: string;
    value: number;
  }>;
  feedbackOverTime: Array<{
    date: string;
    value: number;
  }>;
  topThemes: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  generatedAt: Date;
}

export interface ReportDashboardSummary {
  totalReports: number;
  completed: number;
  generating: number;
  scheduled: number;
  failed: number;
  downloads: number;
}

export interface GeneratedReportData {
  preview: ReportPreview;
  executiveSummary: string;
  keyFindings: string[];
  positiveInsights: string[];
  negativeInsights: string[];
  recommendations: string[];
  conclusion: string;
}

export interface ReportTemplateData {
  name: string;
  description?: string;
  type: ReportType;
  sources: ReportSource[];
  filters?: ReportFilters;
  metrics: ReportMetric[];
  charts?: ReportChartConfiguration[];
  tags?: string[];
}

export type ReportScheduleFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export interface ReportScheduleInput {
  frequency: ReportScheduleFrequency;
  scheduledAt?: Date;
}
