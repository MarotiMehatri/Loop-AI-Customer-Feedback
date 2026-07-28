import { prisma } from "../../config/prisma.js";
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

export const reportScheduleService = {
  calculateNextRun,
  isReportDue,

  async getDueReports(workspaceId?: string) {
    const now = new Date();

    const where: Record<string, unknown> = {
      scheduledAt: { lte: now },
      status: "SCHEDULED",
    };

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    return prisma.report.findMany({
      where: where as never,
      orderBy: { scheduledAt: "asc" },
    });
  },

  async updateSchedule(
    reportId: string,
    workspaceId: string,
    frequency: ReportScheduleFrequency,
    scheduledAt?: Date,
  ) {
    const nextRun = scheduledAt ?? calculateNextRun(frequency);

    return prisma.report.updateMany({
      where: { id: reportId, workspaceId },
      data: {
        scheduledAt: nextRun,
        status: "SCHEDULED",
      },
    });
  },
};
