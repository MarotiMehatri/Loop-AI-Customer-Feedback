import { prisma } from "../lib/prisma.js";
import { logger } from "../config/logger.js";

export const runAnalyticsJob = async (workspaceId: string): Promise<void> => {
  try {
    logger.info(`[AnalyticsJob] Starting analytics refresh for workspace ${workspaceId}`);
    const totalShipments = await prisma.shipment.count({ where: { workspaceId } });
    const deliveredCount = await prisma.shipment.count({ where: { workspaceId, status: "DELIVERED" } });
    logger.info(`[AnalyticsJob] Workspace ${workspaceId}: ${totalShipments} total, ${deliveredCount} delivered`);
    logger.info(`[AnalyticsJob] Analytics refresh completed for workspace ${workspaceId}`);
  } catch (error) {
    logger.error(`[AnalyticsJob] Failed:`, error);
    throw error;
  }
};
