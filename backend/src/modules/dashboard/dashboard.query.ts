import { DASHBOARD_MAX_CUSTOM_RANGE_DAYS } from "./dashboard.constants.js";

import type { DashboardPeriod, DashboardQuery } from "./dashboard.types.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfUtcDay(value: Date): Date {
  return new Date(
    Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
}

function endOfUtcDay(value: Date): Date {
  return new Date(
    Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}

function subtractUtcDays(value: Date, days: number): Date {
  return new Date(value.getTime() - days * DAY_MS);
}

function getPresetDays(range: DashboardQuery["range"]): number {
  switch (range) {
    case "30d":
      return 30;
    case "90d":
      return 90;
    case "7d":
    case "custom":
    default:
      return 7;
  }
}

export function resolveDashboardPeriod(
  query: DashboardQuery,
  now = new Date(),
): DashboardPeriod {
  let startDate: Date;
  let endDate: Date;

  if (query.range === "custom" && query.startDate && query.endDate) {
    startDate = startOfUtcDay(query.startDate);
    endDate = endOfUtcDay(query.endDate);
  } else {
    const days = getPresetDays(query.range);
    endDate = endOfUtcDay(now);
    startDate = startOfUtcDay(subtractUtcDays(endDate, days - 1));
  }

  const durationMs = endDate.getTime() - startDate.getTime() + 1;

  const maxDurationMs = DASHBOARD_MAX_CUSTOM_RANGE_DAYS * DAY_MS;

  const safeDurationMs = Math.min(durationMs, maxDurationMs);

  const previousEndDate = new Date(startDate.getTime() - 1);

  const previousStartDate = new Date(
    previousEndDate.getTime() - safeDurationMs + 1,
  );

  return {
    range: query.range,
    startDate,
    endDate,
    previousStartDate,
    previousEndDate,
  };
}

export function buildDateFilter(
  startDate: Date,
  endDate: Date,
): {
  gte: Date;
  lte: Date;
} {
  return {
    gte: startDate,
    lte: endDate,
  };
}

export function toUtcDateKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function createDailyDateKeys(startDate: Date, endDate: Date): string[] {
  const keys: string[] = [];

  let cursor = startOfUtcDay(startDate);
  const finalDate = startOfUtcDay(endDate);

  while (cursor <= finalDate) {
    keys.push(toUtcDateKey(cursor));
    cursor = new Date(cursor.getTime() + DAY_MS);
  }

  return keys;
}

export function formatDashboardDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
