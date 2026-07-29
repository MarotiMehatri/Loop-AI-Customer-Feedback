import { prisma } from "../../config/prisma.js";

import type { UsageStats } from "./workspace.types.js";

type Period = "daily" | "weekly" | "monthly";

function getPeriodRange(period: Period): Date {
  const now = new Date();

  switch (period) {
    case "daily":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "weekly": {
      const weekStart = new Date(now);
      const day = weekStart.getDay();
      const diff = day === 0 ? 6 : day - 1;
      weekStart.setDate(weekStart.getDate() - diff);
      weekStart.setHours(0, 0, 0, 0);
      return weekStart;
    }
    case "monthly":
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}

export const workspaceUsageService = {
  async getUsage(
    workspaceId: string,
    period: Period = "monthly",
  ): Promise<UsageStats> {
    const since = getPeriodRange(period);

    const [
      activeUsers,
      totalFeedbacks,
      feedbacksThisPeriod,
      reportsGenerated,
      exportCount,
    ] = await Promise.all([
      prisma.user.count({
        where: { workspaceId, isActive: true },
      }),

      prisma.feedback.count({
        where: { workspaceId },
      }),

      prisma.feedback.count({
        where: {
          workspaceId,
          createdAt: { gte: since },
        },
      }),

      prisma.report.count({
        where: {
          workspaceId,
          createdAt: { gte: since },
        },
      }),

      prisma.exportJob.count({
        where: {
          workspaceId,
          createdAt: { gte: since },
        },
      }),
    ]);

    return {
      period,
      activeUsers,
      totalFeedbacks,
      feedbacksThisPeriod,
      aiClassifications: 0,
      reportsGenerated,
      exportsCreated: exportCount,
      apiCalls: 0,
      storageUsedBytes: 0,
    };
  },
};
