import { NotificationType } from "../../generated/prisma/client.js";

import { eventBus } from "../../events/event-bus.js";
import {
  FEEDBACK_CREATED,
  MEMBER_INVITED,
  REPORT_GENERATED,
} from "../../events/event-names.js";
import type {
  FeedbackEventData,
  MemberEventData,
  ReportEventData,
} from "../../events/event.types.js";
import { logger } from "../../config/logger.js";
import { notificationService } from "./notification.service.js";

async function onFeedbackCreated(data: FeedbackEventData): Promise<void> {
  try {
    await notificationService.publish({
      userId: data.id,
      workspaceId: data.workspaceId,
      type: NotificationType.FEEDBACK_CREATED,
      title: "New feedback received",
      message: "A new feedback has been submitted in your workspace.",
      entityType: "feedback",
      entityId: data.id,
    });
  } catch (error) {
    logger.error({ module: "notification-event-handler", event: "feedback:created", error });
  }
}

async function onMemberInvited(data: MemberEventData): Promise<void> {
  try {
    await notificationService.publish({
      userId: data.userId,
      workspaceId: data.workspaceId,
      type: NotificationType.MEMBER_INVITED,
      title: "You've been invited",
      message: "You have been invited to join the workspace.",
      entityType: "member",
      entityId: data.userId,
    });
  } catch (error) {
    logger.error({ module: "notification-event-handler", event: "member:invited", error });
  }
}

async function onReportGenerated(data: ReportEventData): Promise<void> {
  try {
    await notificationService.publish({
      userId: data.id,
      workspaceId: data.workspaceId,
      type: NotificationType.REPORT_COMPLETED,
      title: "Report ready",
      message: "Your requested report has been generated.",
      entityType: "report",
      entityId: data.id,
    });
  } catch (error) {
    logger.error({ module: "notification-event-handler", event: "report:generated", error });
  }
}

export function registerNotificationEventHandlers(): void {
  eventBus.on(FEEDBACK_CREATED, onFeedbackCreated);
  eventBus.on(MEMBER_INVITED, onMemberInvited);
  eventBus.on(REPORT_GENERATED, onReportGenerated);
}
