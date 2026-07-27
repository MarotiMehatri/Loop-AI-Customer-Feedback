export type TrendPeriod = "day" | "week" | "month" | "quarter";

export type TrendMetric =
  | "feedback_count"
  | "sentiment_distribution"
  | "category_distribution"
  | "source_distribution"
  | "avg_sentiment_score";

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

export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TrendResult {
  metric: TrendMetric;
  period: TrendPeriod;
  data: TrendDataPoint[];
  summary: TrendSummary;
}

export interface TrendSummary {
  total: number;
  average: number;
  change: number;
  changePercentage: number;
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
