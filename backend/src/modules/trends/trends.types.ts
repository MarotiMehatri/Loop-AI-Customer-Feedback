export type TrendPeriod = "day" | "week" | "month" | "quarter";

export type TrendMetric =
  | "feedback_count"
  | "sentiment_distribution"
  | "category_distribution"
  | "source_distribution"
  | "avg_sentiment_score";

export type TrendDirection = "up" | "down" | "stable";

export type TrendStrength = "strong" | "moderate" | "weak";

export type InsightType = "POSITIVE" | "WARNING" | "INFO";

export type InsightSeverity = "high" | "medium" | "low";

export interface TrendActorContext {
  userId: string;
  workspaceId: string;
  role: string;
}

export interface GetTrendsQuery {
  period: TrendPeriod;
  metric: TrendMetric;
  startDate?: string;
  endDate?: string;
  category?: string;
  source?: string;
}

export interface GetTrendsComparisonQuery {
  currentPeriod: TrendPeriod;
  previousPeriod: TrendPeriod;
  metric: TrendMetric;
  startDate?: string;
  endDate?: string;
}

export interface TrendFilterQuery {
  startDate?: Date | string;
  endDate?: Date | string;
  source?: string;
  sentiment?: string;
  category?: string;
  status?: string;
}

export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TrendSummary {
  total: number;
  average: number;
  change: number;
  changePercentage: number;
}

export interface TrendResult {
  metric: TrendMetric;
  period: TrendPeriod;
  data: TrendDataPoint[];
  summary: TrendSummary;
}

export interface TrendComparisonResult {
  metric: TrendMetric;
  current: TrendResult;
  previous: TrendResult;
  comparison: {
    absoluteChange: number;
    percentageChange: number;
    direction: "up" | "down" | "stable";
  };
}

export interface TrendDetectionResult {
  direction: TrendDirection;
  strength: TrendStrength;
  confidence: number;
  dataPoints: TrendDataPoint[];
  regression: {
    slope: number;
    intercept: number;
    rSquared: number;
  };
  volatility?: number;
  seasonality?: number[];
}

export interface TrendAnomaly {
  date: string;
  value: number;
  type: "SPIKE" | "DROP";
  zScore: number;
}

export interface TrendInsight {
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  description: string;
  metric: string;
  value: number;
  recommendation?: string;
}

export interface TrendForecast {
  dataPoints: TrendDataPoint[];
  confidenceLower: TrendDataPoint[];
  confidenceUpper: TrendDataPoint[];
  method: "linear" | "moving_average" | "seasonal";
  accuracy: number;
}

export interface TrendDetectionQuery {
  metric: TrendMetric;
  period: TrendPeriod;
  startDate?: string;
  endDate?: string;
  source?: string;
  category?: string;
}

export interface TrendInsightQuery {
  period: TrendPeriod;
  startDate?: string;
  endDate?: string;
  source?: string;
  category?: string;
}

export interface TrendAnomalyQuery {
  period: TrendPeriod;
  startDate?: string;
  endDate?: string;
  threshold?: number;
}

export interface TrendForecastQuery {
  period: TrendPeriod;
  horizon?: number;
  startDate?: string;
  endDate?: string;
}
