import type { AnalyticsGroupBy } from "./analytics.types.js";

export const ANALYTICS_DEFAULT_DAYS = 30;
export const ANALYTICS_MAX_DAYS = 365;
export const ANALYTICS_DEFAULT_GROUP_BY: AnalyticsGroupBy = "day";
export const ANALYTICS_TOP_LIMIT = 10;
export const ANALYTICS_CACHE_TTL_MS = 5 * 60 * 1000;

export const SENTIMENT_LABELS: Record<string, string> = {
  POSITIVE: "Positive",
  NEUTRAL: "Neutral",
  NEGATIVE: "Negative",
};

export const SOURCE_LABELS: Record<string, string> = {
  SUPPORT: "Support",
  APP_STORE: "App Store",
  SURVEY: "Survey",
  SALES: "Sales",
  SOCIAL: "Social",
  WEBSITE: "Website",
  EMAIL: "Email",
  MANUAL: "Manual",
};
