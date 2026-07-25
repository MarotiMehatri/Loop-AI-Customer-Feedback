import { FeedbackStatus, Sentiment } from "../generated/prisma/client.js";

import { logger } from "../config/logger.js";
import { prisma } from "../config/prisma.js";

export async function runAnalyticsJob(workspaceId: string): Promise<void> {
  try {
    logger.info({
      module: "AnalyticsJob",
      message: "Starting analytics refresh",
      workspaceId,
    });

    const [
      totalFeedback,
      positiveFeedback,
      neutralFeedback,
      negativeFeedback,
      newFeedback,
      reviewedFeedback,
      actionedFeedback,
      activeUsers,
      totalThemes,
      totalReports,
    ] = await prisma.$transaction([
      prisma.feedback.count({
        where: {
          workspaceId,
        },
      }),

      prisma.feedback.count({
        where: {
          workspaceId,
          sentiment: Sentiment.POSITIVE,
        },
      }),

      prisma.feedback.count({
        where: {
          workspaceId,
          sentiment: Sentiment.NEUTRAL,
        },
      }),

      prisma.feedback.count({
        where: {
          workspaceId,
          sentiment: Sentiment.NEGATIVE,
        },
      }),

      prisma.feedback.count({
        where: {
          workspaceId,
          status: FeedbackStatus.NEW,
        },
      }),

      prisma.feedback.count({
        where: {
          workspaceId,
          status: FeedbackStatus.REVIEWED,
        },
      }),

      prisma.feedback.count({
        where: {
          workspaceId,
          status: FeedbackStatus.ACTIONED,
        },
      }),

      prisma.user.count({
        where: {
          workspaceId,
          isActive: true,
        },
      }),

      prisma.theme.count({
        where: {
          workspaceId,
        },
      }),

      prisma.report.count({
        where: {
          workspaceId,
        },
      }),
    ]);

    const negativePercentage =
      totalFeedback > 0
        ? Number(((negativeFeedback / totalFeedback) * 100).toFixed(2))
        : 0;

    logger.info({
      module: "AnalyticsJob",
      message: "Analytics refresh completed successfully",

      workspaceId,

      analytics: {
        totalFeedback,

        sentiment: {
          positive: positiveFeedback,
          neutral: neutralFeedback,
          negative: negativeFeedback,
          negativePercentage,
        },

        status: {
          new: newFeedback,
          reviewed: reviewedFeedback,
          actioned: actionedFeedback,
        },

        activeUsers,
        totalThemes,
        totalReports,
      },
    });
  } catch (error) {
    logger.error({
      module: "AnalyticsJob",
      message: "Analytics refresh failed",
      workspaceId,
      error,
    });

    throw error;
  }
}
