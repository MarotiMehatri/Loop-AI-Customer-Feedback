import { NotificationType } from "../../generated/prisma/client.js";

import { notificationPublisher } from "../notifications/notification.publisher.js";

interface BaseReportNotificationInput {
  userId: string;
  workspaceId: string;
  reportId: string;
  reportTitle: string;
}

interface ReportCreatedNotificationInput extends BaseReportNotificationInput {
  status: string;
}

interface ReportExportedNotificationInput extends BaseReportNotificationInput {
  format: string;
  fileName?: string;
}

export const reportNotificationPublisher = {
  created(input: ReportCreatedNotificationInput): Promise<void> {
    return notificationPublisher.publishSafe({
      userId: input.userId,
      workspaceId: input.workspaceId,

      type: NotificationType.REPORT_CREATED,

      title: "Report created",

      message: `Your report "${input.reportTitle}" was created successfully.`,

      entityType: "REPORT",
      entityId: input.reportId,

      metadata: {
        status: input.status,
      },
    });
  },

  completed(input: BaseReportNotificationInput): Promise<void> {
    return notificationPublisher.publishSafe({
      userId: input.userId,
      workspaceId: input.workspaceId,

      type: NotificationType.REPORT_COMPLETED,

      title: "Report completed",

      message: `Your report "${input.reportTitle}" is ready to view.`,

      entityType: "REPORT",
      entityId: input.reportId,

      metadata: {
        completedAt: new Date().toISOString(),
      },
    });
  },

  failed(input: BaseReportNotificationInput): Promise<void> {
    return notificationPublisher.publishSafe({
      userId: input.userId,
      workspaceId: input.workspaceId,

      type: NotificationType.REPORT_FAILED,

      title: "Report generation failed",

      message: `Report "${input.reportTitle}" could not be generated. Please try again.`,

      entityType: "REPORT",
      entityId: input.reportId,

      metadata: {
        failedAt: new Date().toISOString(),
      },
    });
  },

  exported(input: ReportExportedNotificationInput): Promise<void> {
    return notificationPublisher.publishSafe({
      userId: input.userId,
      workspaceId: input.workspaceId,

      type: NotificationType.REPORT_EXPORTED,

      title: "Report exported",

      message: `Report "${input.reportTitle}" was exported as ${input.format}.`,

      entityType: "REPORT",
      entityId: input.reportId,

      metadata: {
        format: input.format,

        ...(input.fileName
          ? {
              fileName: input.fileName,
            }
          : {}),
      },
    });
  },
};
