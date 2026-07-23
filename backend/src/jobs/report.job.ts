import { prisma } from "../lib/prisma.js";
import { logger } from "../config/logger.js";

export const runReportJob = async (): Promise<void> => {
  try {
    logger.info("[ReportJob] Starting scheduled report check");
    const recentReports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    logger.info(`[ReportJob] Found ${recentReports.length} recent reports`);
    logger.info("[ReportJob] Report job completed");
  } catch (error) {
    logger.error("[ReportJob] Failed:", error);
    throw error;
  }
};
