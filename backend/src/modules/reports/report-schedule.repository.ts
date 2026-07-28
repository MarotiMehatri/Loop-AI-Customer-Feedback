import { prisma } from "../../config/prisma.js";

export const reportScheduleRepository = {
  async findScheduledReports(workspaceId: string) {
    return prisma.report.findMany({
      where: {
        workspaceId,
        scheduledAt: { not: null },
      },
      orderBy: { scheduledAt: "asc" },
      select: {
        id: true,
        title: true,
        status: true,
        scheduledAt: true,
        createdAt: true,
      },
    });
  },

  async findOverdueReports(workspaceId: string) {
    const now = new Date();

    return prisma.report.findMany({
      where: {
        workspaceId,
        status: "SCHEDULED",
        scheduledAt: { lte: now },
      },
      orderBy: { scheduledAt: "asc" },
    });
  },

  async clearSchedule(reportId: string, workspaceId: string) {
    return prisma.report.updateMany({
      where: { id: reportId, workspaceId },
      data: {
        scheduledAt: null,
        status: "DRAFT",
      },
    });
  },

  async getScheduleStats(workspaceId: string) {
    const now = new Date();

    const [total, pending, overdue] = await Promise.all([
      prisma.report.count({
        where: {
          workspaceId,
          scheduledAt: { not: null },
        },
      }),
      prisma.report.count({
        where: {
          workspaceId,
          status: "SCHEDULED",
          scheduledAt: { gt: now },
        },
      }),
      prisma.report.count({
        where: {
          workspaceId,
          status: "SCHEDULED",
          scheduledAt: { lte: now },
        },
      }),
    ]);

    return { total, pending, overdue };
  },
};
