import type { ReportScheduleFrequency } from "./report.types.js";

export function calculateNextRun(
  frequency: ReportScheduleFrequency,
  fromDate = new Date(),
): Date {
  const nextRun = new Date(fromDate);

  switch (frequency) {
    case "DAILY":
      nextRun.setDate(nextRun.getDate() + 1);
      break;

    case "WEEKLY":
      nextRun.setDate(nextRun.getDate() + 7);
      break;

    case "MONTHLY":
      nextRun.setMonth(nextRun.getMonth() + 1);
      break;
  }

  return nextRun;
}

export function isReportDue(
  scheduledAt: Date | null,
  now = new Date(),
): boolean {
  return Boolean(scheduledAt && scheduledAt.getTime() <= now.getTime());
}
