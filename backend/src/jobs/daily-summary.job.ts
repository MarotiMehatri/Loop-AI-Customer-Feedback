import { prisma } from "../lib/prisma.js";
import { logger } from "../config/logger.js";

export const runDailySummaryJob = async (): Promise<void> => {
  try {
    logger.info("[DailySummaryJob] Starting daily shipment summary generation");

    const workspaces = await prisma.workspace.findMany({
      select: { id: true, name: true },
    });

    for (const workspace of workspaces) {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const totalShipments = await prisma.shipment.count({
          where: {
            workspaceId: workspace.id,
            createdAt: { gte: today, lt: tomorrow },
          },
        });

        const deliveredCount = await prisma.shipment.count({
          where: {
            workspaceId: workspace.id,
            status: "DELIVERED",
            updatedAt: { gte: today, lt: tomorrow },
          },
        });

        const failedCount = await prisma.shipment.count({
          where: {
            workspaceId: workspace.id,
            status: "FAILED",
            updatedAt: { gte: today, lt: tomorrow },
          },
        });

        const delayedCount = await prisma.shipment.count({
          where: {
            workspaceId: workspace.id,
            status: "DELAYED",
            updatedAt: { gte: today, lt: tomorrow },
          },
        });

        const adminUser = await prisma.user.findFirst({
          where: { workspaceId: workspace.id },
        });
        if (!adminUser) continue;

        await prisma.notification.create({
          data: {
            workspaceId: workspace.id,
            userId: adminUser.id,
            type: "DAILY_SUMMARY",
            title: `Daily Shipment Summary - ${today.toLocaleDateString()}`,
            message: JSON.stringify({
              total: totalShipments,
              delivered: deliveredCount,
              failed: failedCount,
              delayed: delayedCount,
            }),
          },
        });

        logger.info(`[DailySummaryJob] Summary generated for workspace ${workspace.id}`);
      } catch (error) {
        logger.error(`[DailySummaryJob] Failed for workspace ${workspace.id}:`, error);
      }
    }

    logger.info("[DailySummaryJob] Daily summary generation completed");
  } catch (error) {
    logger.error("[DailySummaryJob] Failed to run daily summary job:", error);
    throw error;
  }
};
