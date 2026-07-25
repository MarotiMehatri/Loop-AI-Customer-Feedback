import type { ReportPreview } from "./report.types.js";

export function calculatePercentage(value: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Number(((value / total) * 100).toFixed(2));
}

export function normalizeTags(tags: string[] = []): string[] {
  return Array.from(
    new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)),
  );
}

export function createReportFileName(title: string, extension: string): string {
  const normalized = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const date = new Date().toISOString().slice(0, 10);

  return `${normalized || "report"}-${date}.${extension}`;
}

export function groupFeedbackByDate(
  dates: Date[],
): ReportPreview["feedbackOverTime"] {
  const grouped = new Map<string, number>();

  for (const date of dates) {
    const key = date.toISOString().slice(0, 10);

    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }

  return Array.from(grouped.entries())
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([date, value]) => ({
      date,
      value,
    }));
}

export function countByValue(values: string[]): Array<{
  name: string;
  value: number;
}> {
  const grouped = new Map<string, number>();

  for (const value of values) {
    const key = value.trim() || "UNKNOWN";

    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }

  return Array.from(grouped.entries())
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((first, second) => second.value - first.value);
}
