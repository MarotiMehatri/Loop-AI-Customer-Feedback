import {
  FeedbackStatus,
  NotificationType,
  Role,
  Sentiment,
} from "../generated/prisma/client.js";

import { logger } from "../config/logger.js";
import { prisma } from "../config/prisma.js";

import { notificationPublisher } from "../modules/notifications/notification.publisher.js";

function getTodayDateRange(): {
  startDate: Date;
  endDate: Date;
} {
  const startDate = new Date();

  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);

  endDate.setDate(endDate.getDate() + 1);

  return {
    startDate,
    endDate,
  };
}

export async function runDailySummaryJob(): Promise<void> {
  try {
    logger.info({
      module: "DailySummaryJob",
      message: "Starting daily feedback summary generation",
    });

    const workspaces = await prisma.workspace.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const { startDate, endDate } = getTodayDateRange();

    for (const workspace of workspaces) {
      try {
        const createdTodayFilter = {
          workspaceId: workspace.id,

          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        };

        const [
          totalFeedback,
          positiveFeedback,
          neutralFeedback,
          negativeFeedback,
          newFeedback,
          reviewedFeedback,
          actionedFeedback,
          administrators,
        ] = await prisma.$transaction([
          prisma.feedback.count({
            where: createdTodayFilter,
          }),

          prisma.feedback.count({
            where: {
              ...createdTodayFilter,
              sentiment: Sentiment.POSITIVE,
            },
          }),

          prisma.feedback.count({
            where: {
              ...createdTodayFilter,
              sentiment: Sentiment.NEUTRAL,
            },
          }),

          prisma.feedback.count({
            where: {
              ...createdTodayFilter,
              sentiment: Sentiment.NEGATIVE,
            },
          }),

          prisma.feedback.count({
            where: {
              ...createdTodayFilter,
              status: FeedbackStatus.NEW,
            },
          }),

          prisma.feedback.count({
            where: {
              ...createdTodayFilter,
              status: FeedbackStatus.REVIEWED,
            },
          }),

          prisma.feedback.count({
            where: {
              ...createdTodayFilter,
              status: FeedbackStatus.ACTIONED,
            },
          }),

          prisma.user.findMany({
            where: {
              workspaceId: workspace.id,
              role: Role.ADMIN,
              isActive: true,
            },

            select: {
              id: true,
            },
          }),
        ]);

        if (administrators.length === 0) {
          logger.info({
            module: "DailySummaryJob",
            message: "No active administrator found; notification skipped",
            workspaceId: workspace.id,
          });

          continue;
        }

        const negativePercentage =
          totalFeedback > 0
            ? Number(((negativeFeedback / totalFeedback) * 100).toFixed(2))
            : 0;

        const summaryMessage = [
          `${totalFeedback} feedback records were received today.`,
          `Positive: ${positiveFeedback},`,
          `Neutral: ${neutralFeedback},`,
          `Negative: ${negativeFeedback}.`,
          `New: ${newFeedback},`,
          `Reviewed: ${reviewedFeedback},`,
          `Actioned: ${actionedFeedback}.`,
        ].join(" ");

        await notificationPublisher.publishManySafe(
          administrators.map((administrator) => ({
            userId: administrator.id,
            workspaceId: workspace.id,

            type: NotificationType.SYSTEM,

            title: `Daily Feedback Summary — ${workspace.name}`,

            message: summaryMessage,

            entityType: "DAILY_FEEDBACK_SUMMARY",

            entityId: workspace.id,

            metadata: {
              summaryDate: startDate.toISOString(),

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
            },
          })),
        );

        logger.info({
          module: "DailySummaryJob",
          message: "Daily feedback summary generated successfully",

          workspaceId: workspace.id,
          workspaceName: workspace.name,

          administratorCount: administrators.length,

          totalFeedback,
        });
      } catch (error) {
        logger.error({
          module: "DailySummaryJob",
          message: "Daily summary generation failed for workspace",
          workspaceId: workspace.id,
          error,
        });
      }
    }

    logger.info({
      module: "DailySummaryJob",
      message: "Daily feedback summary generation completed",
      workspaceCount: workspaces.length,
    });
  } catch (error) {
    logger.error({
      module: "DailySummaryJob",
      message: "Daily summary job failed",
      error,
    });

    throw error;
  }
}
