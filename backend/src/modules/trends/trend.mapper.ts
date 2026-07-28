import type {
  TrendDataPoint,
  TrendDetectionResult,
  TrendInsight,
  TrendForecast,
} from "./trends.types.js";

export function mapTrendDataPoint(raw: {
  date: string;
  value: number;
  label?: string;
}): TrendDataPoint {
  return {
    date: raw.date,
    value: raw.value,
    ...(raw.label ? { label: raw.label } : {}),
  };
}

export function mapTrendDataPoints(
  raw: Array<{ date: string; value: number; label?: string }>,
): TrendDataPoint[] {
  return raw.map(mapTrendDataPoint);
}

export function mapDetectionResult(raw: {
  direction: TrendDetectionResult["direction"];
  strength: TrendDetectionResult["strength"];
  confidence: number;
  dataPoints: TrendDataPoint[];
  regression: TrendDetectionResult["regression"];
  seasonality?: number[];
}): TrendDetectionResult {
  return {
    direction: raw.direction,
    strength: raw.strength,
    confidence: raw.confidence,
    dataPoints: raw.dataPoints,
    regression: raw.regression,
    ...(raw.seasonality ? { seasonality: raw.seasonality } : {}),
  };
}

export function mapInsight(raw: {
  type: TrendInsight["type"];
  severity: TrendInsight["severity"];
  title: string;
  description: string;
  metric: string;
  value: number;
  recommendation?: string;
}): TrendInsight {
  return {
    type: raw.type,
    severity: raw.severity,
    title: raw.title,
    description: raw.description,
    metric: raw.metric,
    value: raw.value,
    ...(raw.recommendation ? { recommendation: raw.recommendation } : {}),
  };
}

export function mapInsights(
  raw: Array<{
    type: TrendInsight["type"];
    severity: TrendInsight["severity"];
    title: string;
    description: string;
    metric: string;
    value: number;
    recommendation?: string;
  }>,
): TrendInsight[] {
  return raw.map(mapInsight);
}

export function mapForecast(raw: {
  dataPoints: TrendDataPoint[];
  confidenceLower: TrendDataPoint[];
  confidenceUpper: TrendDataPoint[];
  method: TrendForecast["method"];
  accuracy: number;
}): TrendForecast {
  return {
    dataPoints: raw.dataPoints,
    confidenceLower: raw.confidenceLower,
    confidenceUpper: raw.confidenceUpper,
    method: raw.method,
    accuracy: raw.accuracy,
  };
}
