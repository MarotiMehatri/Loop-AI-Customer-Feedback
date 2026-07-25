export const REPORT_DEFAULT_PAGE = 1;
export const REPORT_DEFAULT_LIMIT = 10;
export const REPORT_MAX_LIMIT = 100;
export const REPORT_MAX_TAGS = 10;
export const REPORT_MAX_TITLE_LENGTH = 150;
export const REPORT_MAX_DESCRIPTION_LENGTH = 500;

export const DEFAULT_REPORT_METRICS = [
  "TOTAL_FEEDBACK",
  "POSITIVE_FEEDBACK",
  "NEGATIVE_FEEDBACK",
  "SENTIMENT_DISTRIBUTION",
  "TOP_THEMES",
  "FEEDBACK_TREND",
] as const;

export const DEFAULT_REPORT_SOURCES = [
  "SUPPORT",
  "APP_STORE",
  "SURVEY",
] as const;

export const DEFAULT_REPORT_CHARTS = [
  {
    type: "LINE",
    metric: "FEEDBACK_TREND",
    title: "Feedback Over Time",
  },
  {
    type: "DONUT",
    metric: "SENTIMENT_DISTRIBUTION",
    title: "Sentiment Distribution",
  },
  {
    type: "BAR",
    metric: "TOP_THEMES",
    title: "Top Themes",
  },
] as const;

export const REPORT_CACHE_TTL_MS = 5 * 60 * 1000;

export const REPORT_MESSAGES = {
  created: "Report created successfully",
  updated: "Report updated successfully",
  deleted: "Report deleted successfully",
  generated: "Report generated successfully",
  scheduled: "Report scheduled successfully",
  notFound: "Report not found",
  generationFailed: "Report generation failed",
} as const;
