import { TREND_MIN_DATA_POINTS, TREND_ANOMALY_THRESHOLD } from "./trend.constants.js";
import { mapForecast } from "./trend.mapper.js";
import { trendRepository } from "./trend.repository.js";

import {
  calculateStandardDeviation,
  calculateVolatility,
  calculateTrendDirection,
  calculateSeasonalIndex,
  linearRegression,
} from "./trend.calculator.js";

import type {
  TrendDataPoint,
  TrendDetectionResult,
  TrendFilterQuery,
  TrendForecast,
  TrendPeriod,
} from "./trends.types.js";

function calculateStrength(
  direction: "up" | "down" | "stable",
  rSquared: number,
): "strong" | "moderate" | "weak" {
  if (direction === "stable") return "weak";

  if (rSquared > 0.7) return "strong";
  if (rSquared > 0.4) return "moderate";
  return "weak";
}

function calculateConfidence(
  dataPoints: TrendDataPoint[],
  rSquared: number,
  stdDev: number,
): number {
  if (dataPoints.length < TREND_MIN_DATA_POINTS) return 0;

  const n = dataPoints.length;
  const dataQuality = Math.min(n / 30, 1);
  const fitQuality = rSquared;
  const values = dataPoints.map((p) => p.value);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const cv = mean !== 0 ? stdDev / Math.abs(mean) : 1;
  const stabilityScore = Math.max(0, 1 - cv);

  return Number(
    ((dataQuality * 0.3 + fitQuality * 0.4 + stabilityScore * 0.3) * 100).toFixed(1),
  );
}

function aggregateByPeriod(
  rows: Array<{ createdAt: Date }>,
  period: TrendPeriod,
): TrendDataPoint[] {
  const dateMap = new Map<string, number>();

  for (const row of rows) {
    const key = getPeriodKey(row.createdAt, period);
    dateMap.set(key, (dateMap.get(key) ?? 0) + 1);
  }

  return Array.from(dateMap.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getPeriodKey(date: Date, period: TrendPeriod): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  switch (period) {
    case "day":
      return `${year}-${month}-${day}`;
    case "week": {
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const wYear = weekStart.getFullYear();
      const wMonth = String(weekStart.getMonth() + 1).padStart(2, "0");
      const wDay = String(weekStart.getDate()).padStart(2, "0");
      return `${wYear}-${wMonth}-${wDay}`;
    }
    case "month":
      return `${year}-${month}`;
    case "quarter": {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `${year}-Q${quarter}`;
    }
  }
}

export const trendDetectionService = {
  async detectTrend(
    workspaceId: string,
    metric: string,
    period: TrendPeriod,
    query: TrendFilterQuery,
  ): Promise<TrendDetectionResult> {
    const rows = await trendRepository.getFeedbackCountByDate(workspaceId, query);

    if (rows.length < TREND_MIN_DATA_POINTS) {
      return {
        direction: "stable",
        strength: "weak",
        confidence: 0,
        dataPoints: [],
        regression: { slope: 0, intercept: 0, rSquared: 0 },
      };
    }

    const dataPoints = aggregateByPeriod(rows, period);
    const values = dataPoints.map((p) => p.value);
    const regression = linearRegression(dataPoints);
    const direction = calculateTrendDirection(dataPoints);
    const strength = calculateStrength(direction, regression.rSquared);
    const stdDev = calculateStandardDeviation(values);
    const confidence = calculateConfidence(dataPoints, regression.rSquared, stdDev);
    const volatility = calculateVolatility(values);

    const result: TrendDetectionResult = {
      direction,
      strength,
      confidence,
      dataPoints,
      regression,
      volatility,
    };

    if (dataPoints.length >= 60) {
      const seasonalIndex = calculateSeasonalIndex(values, period === "day" ? 7 : period === "month" ? 12 : 4);
      if (seasonalIndex.length > 0) {
        result.seasonality = seasonalIndex;
      }
    }

    return result;
  },

  async detectAnomalies(
    workspaceId: string,
    period: TrendPeriod,
    query: TrendFilterQuery,
  ) {
    const rows = await trendRepository.getFeedbackCountByDate(workspaceId, query);

    if (rows.length < 3) {
      return { anomalies: [], dataPoints: [] };
    }

    const dataPoints = aggregateByPeriod(rows, period);
    const values = dataPoints.map((p) => p.value);

    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const stdDev = calculateStandardDeviation(values);

    if (stdDev === 0) {
      return { anomalies: [], dataPoints };
    }

    const anomalies = dataPoints
      .filter((point) => {
        const zScore = (point.value - mean) / stdDev;
        return Math.abs(zScore) > TREND_ANOMALY_THRESHOLD;
      })
      .map((point) => {
        const zScore = (point.value - mean) / stdDev;
        return {
          date: point.date,
          value: point.value,
          type: (zScore > 0 ? "SPIKE" : "DROP") as "SPIKE" | "DROP",
          zScore: Number(zScore.toFixed(2)),
        };
      });

    return { anomalies, dataPoints };
  },

  async generateForecast(
    workspaceId: string,
    period: TrendPeriod,
    horizon: number,
    query: TrendFilterQuery,
  ): Promise<TrendForecast> {
    const rows = await trendRepository.getFeedbackCountByDate(workspaceId, query);

    if (rows.length < TREND_MIN_DATA_POINTS) {
      return {
        dataPoints: [],
        confidenceLower: [],
        confidenceUpper: [],
        method: "linear",
        accuracy: 0,
      };
    }

    const dataPoints = aggregateByPeriod(rows, period);
    const values = dataPoints.map((p) => p.value);
    const regression = linearRegression(dataPoints);
    const stdDev = calculateStandardDeviation(values);

    const lastIndex = dataPoints.length - 1;
    const forecastPoints: TrendDataPoint[] = [];
    const confidenceLower: TrendDataPoint[] = [];
    const confidenceUpper: TrendDataPoint[] = [];

    for (let i = 1; i <= horizon; i++) {
      const x = lastIndex + i;
      const predicted = regression.slope * x + regression.intercept;
      const lastPoint = dataPoints[dataPoints.length - 1];

      if (!lastPoint) continue;

      const forecastDate = getNextPeriodDate(lastPoint.date, period, i);

      forecastPoints.push({ date: forecastDate, value: Math.max(0, Math.round(predicted)) });
      confidenceLower.push({
        date: forecastDate,
        value: Math.max(0, Math.round(predicted - 1.96 * stdDev)),
      });
      confidenceUpper.push({
        date: forecastDate,
        value: Math.round(predicted + 1.96 * stdDev),
      });
    }

    const n = dataPoints.length;
    const yMean = values.reduce((s, v) => s + v, 0) / n;
    const ssRes = values.reduce(
      (s, v, i) => s + Math.pow(v - (regression.slope * i + regression.intercept), 2),
      0,
    );
    const ssTot = values.reduce((s, v) => s + Math.pow(v - yMean, 2), 0);
    const accuracy = ssTot !== 0 ? Number((1 - ssRes / ssTot) * 100) : 0;

    return mapForecast({
      dataPoints: forecastPoints,
      confidenceLower,
      confidenceUpper,
      method: "linear",
      accuracy: Math.max(0, Number(accuracy.toFixed(1))),
    });
  },
};

function getNextPeriodDate(
  currentDate: string,
  period: TrendPeriod,
  step: number,
): string {
  const date = new Date(currentDate);

  switch (period) {
    case "day":
      date.setDate(date.getDate() + step);
      return date.toISOString().split("T")[0] ?? currentDate;
    case "week":
      date.setDate(date.getDate() + 7 * step);
      return date.toISOString().split("T")[0] ?? currentDate;
    case "month": {
      date.setMonth(date.getMonth() + step);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    }
    case "quarter": {
      date.setMonth(date.getMonth() + 3 * step);
      const year = date.getFullYear();
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `${year}-Q${quarter}`;
    }
  }
}
