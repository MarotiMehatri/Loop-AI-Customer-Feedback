import type {
  AnalyticsGroupBy,
  DistributionItem,
  TrendDataPoint,
} from "./analytics.types.js";

export function calculatePercentage(count: number, total: number): number {
  return total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;
}

export function toDateKey(date: Date, groupBy: AnalyticsGroupBy): string {
  const value = new Date(date);
  if (groupBy === "month")
    return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}`;
  if (groupBy === "week") {
    const monday = new Date(
      Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
    );
    const day = monday.getUTCDay() || 7;
    monday.setUTCDate(monday.getUTCDate() - day + 1);
    return monday.toISOString().slice(0, 10);
  }
  return value.toISOString().slice(0, 10);
}

export function createTrendMap(
  rows: Array<{ createdAt: Date; sentiment: string }>,
  groupBy: AnalyticsGroupBy,
): TrendDataPoint[] {
  const map = new Map<string, TrendDataPoint>();
  for (const row of rows) {
    const period = toDateKey(row.createdAt, groupBy);
    const item = map.get(period) ?? {
      period,
      total: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
    };
    item.total += 1;
    if (row.sentiment === "POSITIVE") item.positive += 1;
    if (row.sentiment === "NEUTRAL") item.neutral += 1;
    if (row.sentiment === "NEGATIVE") item.negative += 1;
    map.set(period, item);
  }
  return [...map.values()].sort((a, b) => a.period.localeCompare(b.period));
}

export function mapDistribution(
  rows: Array<{ key: string; count: number }>,
  total: number,
  labels: Record<string, string> = {},
): DistributionItem[] {
  return rows
    .map((row) => ({
      ...row,
      label: labels[row.key] ?? row.key,
      percentage: calculatePercentage(row.count, total),
    }))
    .sort((a, b) => b.count - a.count);
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
