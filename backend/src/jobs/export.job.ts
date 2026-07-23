import { prisma } from "../lib/prisma.js";
import { logger } from "../config/logger.js";

export const runExportJob = async (): Promise<void> => {
  try {
    logger.info("[ExportJob] Starting export job check");
    const recentReports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    logger.info(`[ExportJob] Found ${recentReports.length} recent reports`);
    logger.info("[ExportJob] Export job completed");
  } catch (error) {
    logger.error("[ExportJob] Failed:", error);
    throw error;
  }
};
