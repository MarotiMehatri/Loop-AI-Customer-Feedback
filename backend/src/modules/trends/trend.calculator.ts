import type { TrendDataPoint } from "./trends.types.js";

export function calculateSentimentScore(
  positive: number,
  neutral: number,
  negative: number,
): number {
  const total = positive + neutral + negative;
  if (total === 0) return 0;
  return Number((((positive - negative) / total) * 100).toFixed(1));
}

export function calculateGrowthRate(
  current: number,
  previous: number,
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export function calculateMovingAverage(
  values: number[],
  windowSize: number,
): number[] {
  if (values.length === 0) return [];
  if (values.length < windowSize) {
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    return values.map(() => Number(avg.toFixed(1)));
  }

  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = values.slice(start, i + 1);
    const avg = window.reduce((sum, v) => sum + v, 0) / window.length;
    result.push(Number(avg.toFixed(1)));
  }
  return result;
}

export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  const avgSquaredDiff =
    squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  return Number(Math.sqrt(avgSquaredDiff).toFixed(2));
}

export function calculateVolatility(values: number[]): number {
  if (values.length < 2) return 0;
  const changes: number[] = [];
  for (let i = 1; i < values.length; i++) {
    const prev = values[i - 1];
    const curr = values[i];
    if (prev !== undefined && curr !== undefined && prev !== 0) {
      changes.push(Math.abs((curr - prev) / prev));
    }
  }
  if (changes.length === 0) return 0;
  const avgChange =
    changes.reduce((sum, v) => sum + v, 0) / changes.length;
  return Number((avgChange * 100).toFixed(1));
}

export function detectAnomalies(
  dataPoints: TrendDataPoint[],
  threshold: number = 2,
): Array<{ date: string; value: number; type: "SPIKE" | "DROP" }> {
  if (dataPoints.length < 3) return [];

  const values = dataPoints.map((p) => p.value);
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const stdDev = calculateStandardDeviation(values);

  if (stdDev === 0) return [];

  const anomalies: Array<{ date: string; value: number; type: "SPIKE" | "DROP" }> = [];

  for (const point of dataPoints) {
    const zScore = (point.value - mean) / stdDev;
    if (zScore > threshold) {
      anomalies.push({
        date: point.date,
        value: point.value,
        type: "SPIKE",
      });
    } else if (zScore < -threshold) {
      anomalies.push({
        date: point.date,
        value: point.value,
        type: "DROP",
      });
    }
  }

  return anomalies;
}

export function calculateTrendDirection(
  dataPoints: TrendDataPoint[],
): "up" | "down" | "stable" {
  if (dataPoints.length < 2) return "stable";

  const first = dataPoints[0];
  const last = dataPoints[dataPoints.length - 1];
  if (!first || !last) return "stable";

  const change = last.value - first.value;
  const percentage = first.value !== 0 ? (change / Math.abs(first.value)) * 100 : 0;

  if (Math.abs(percentage) < 5) return "stable";
  return percentage > 0 ? "up" : "down";
}

export function calculateSeasonalIndex(
  values: number[],
  periodLength: number,
): number[] {
  if (values.length < periodLength * 2) return [];

  const periods: number[][] = [];
  for (let i = 0; i < values.length; i += periodLength) {
    const period = values.slice(i, i + periodLength);
    if (period.length === periodLength) {
      periods.push(period);
    }
  }

  if (periods.length === 0) return [];

  const averages = Array.from({ length: periodLength }, (_, i) => {
    const sum = periods.reduce((total, period) => total + (period[i] ?? 0), 0);
    return sum / periods.length;
  });

  const grandMean = averages.reduce((sum, v) => sum + v, 0) / periodLength;

  return averages.map((avg) =>
    grandMean !== 0 ? Number((avg / grandMean).toFixed(3)) : 0,
  );
}

export function calculateConfidenceInterval(
  values: number[],
  confidenceLevel: number = 0.95,
): { lower: number; upper: number } {
  const n = values.length;
  if (n < 2) return { lower: 0, upper: 0 };

  const mean = values.reduce((sum, v) => sum + v, 0) / n;
  const stdDev = calculateStandardDeviation(values);
  const zScore = confidenceLevel === 0.99 ? 2.576 : confidenceLevel === 0.95 ? 1.96 : 1.645;
  const margin = (zScore * stdDev) / Math.sqrt(n);

  return {
    lower: Number((mean - margin).toFixed(2)),
    upper: Number((mean + margin).toFixed(2)),
  };
}

export function linearRegression(
  dataPoints: TrendDataPoint[],
): { slope: number; intercept: number; rSquared: number } {
  const n = dataPoints.length;
  if (n < 2) return { slope: 0, intercept: 0, rSquared: 0 };

  const xValues = dataPoints.map((_, i) => i);
  const yValues = dataPoints.map((p) => p.value);

  const sumX = xValues.reduce((s, v) => s + v, 0);
  const sumY = yValues.reduce((s, v) => s + v, 0);
  const sumXY = xValues.reduce((s, v, i) => s + v * (yValues[i] ?? 0), 0);
  const sumX2 = xValues.reduce((s, v) => s + v * v, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const yMean = sumY / n;
  const ssRes = yValues.reduce((s, v, i) => s + Math.pow(v - (slope * (xValues[i] ?? 0) + intercept), 2), 0);
  const ssTot = yValues.reduce((s, v) => s + Math.pow(v - yMean, 2), 0);
  const rSquared = ssTot !== 0 ? Number((1 - ssRes / ssTot).toFixed(4)) : 0;

  return {
    slope: Number(slope.toFixed(4)),
    intercept: Number(intercept.toFixed(2)),
    rSquared,
  };
}
