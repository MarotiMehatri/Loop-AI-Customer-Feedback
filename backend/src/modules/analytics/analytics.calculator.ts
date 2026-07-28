import type {
  DistributionItem,
  TrendDataPoint,
} from "./analytics.types.js";

export function calculateGrowthRate(
  current: number,
  previous: number,
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export function calculateSentimentScore(
  positive: number,
  neutral: number,
  negative: number,
): number {
  const total = positive + neutral + negative;
  if (total === 0) return 0;
  return Number((((positive - negative) / total) * 100).toFixed(1));
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

export function detectAnomalies(
  trendPoints: TrendDataPoint[],
  threshold: number = 2,
): Array<{ period: string; value: number; type: "SPIKE" | "DROP" }> {
  if (trendPoints.length < 3) return [];

  const totals = trendPoints.map((p) => p.total);
  const mean = totals.reduce((sum, v) => sum + v, 0) / totals.length;
  const stdDev = calculateStandardDeviation(totals);

  if (stdDev === 0) return [];

  const anomalies: Array<{ period: string; value: number; type: "SPIKE" | "DROP" }> = [];

  for (const point of trendPoints) {
    const zScore = (point.total - mean) / stdDev;
    if (zScore > threshold) {
      anomalies.push({
        period: point.period,
        value: point.total,
        type: "SPIKE",
      });
    } else if (zScore < -threshold) {
      anomalies.push({
        period: point.period,
        value: point.total,
        type: "DROP",
      });
    }
  }

  return anomalies;
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

export function calculateDistributionConcentration(
  distribution: DistributionItem[],
): number {
  if (distribution.length === 0) return 0;
  if (distribution.length === 1) return 100;
  const sorted = [...distribution].sort((a, b) => b.count - a.count);
  const total = sorted.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) return 0;
  const topItem = sorted[0];
  if (!topItem) return 0;
  return Number(((topItem.count / total) * 100).toFixed(1));
}

export function calculateWeekOverWeekChange(
  currentWeek: number,
  previousWeek: number,
): {
  change: number;
  direction: "UP" | "DOWN" | "STABLE";
} {
  const change = calculateGrowthRate(currentWeek, previousWeek);
  let direction: "UP" | "DOWN" | "STABLE" = "STABLE";
  if (change > 0) direction = "UP";
  else if (change < 0) direction = "DOWN";
  return { change, direction };
}

export function calculatePeakHour(
  hourlyData: Array<{ hour: number; count: number }>,
): { hour: number; label: string; count: number } | null {
  if (hourlyData.length === 0) return null;
  const sorted = [...hourlyData].sort((a, b) => b.count - a.count);
  const peak = sorted[0];
  if (!peak || peak.count === 0) return null;
  return {
    hour: peak.hour,
    label: `${String(peak.hour).padStart(2, "0")}:00`,
    count: peak.count,
  };
}

export function calculateAverageResponseTime(
  feedbackCreatedAt: Date[],
  responseAt: Date[],
): number {
  if (feedbackCreatedAt.length === 0 || responseAt.length === 0) return 0;
  const pairs = Math.min(feedbackCreatedAt.length, responseAt.length);
  let totalMs = 0;
  for (let i = 0; i < pairs; i++) {
    const created = feedbackCreatedAt[i];
    const responded = responseAt[i];
    if (created && responded) {
      totalMs += responded.getTime() - created.getTime();
    }
  }
  return Number((totalMs / pairs / (1000 * 60 * 60)).toFixed(1));
}
