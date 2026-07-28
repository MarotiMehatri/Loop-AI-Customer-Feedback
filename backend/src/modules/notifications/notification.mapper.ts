import type { Notification } from "../../generated/prisma/client.js";

import type { NotificationResponse } from "./notification.types.js";

function toResponse(notification: Notification): NotificationResponse {
  return {
    id: notification.id,

    userId: notification.userId,

    workspaceId: notification.workspaceId,

    type: notification.type,

    title: notification.title,

    message: notification.message,

    metadata: notification.metadata,

    isRead: notification.isRead,

    readAt: notification.readAt ? notification.readAt.toISOString() : null,

    entityType: notification.entityType,

    entityId: notification.entityId,

    priority: notification.priority,

    createdAt: notification.createdAt.toISOString(),

    updatedAt: notification.updatedAt.toISOString(),
  };
}

function toResponseList(notifications: Notification[]): NotificationResponse[] {
  return notifications.map(toResponse);
}

export const notificationMapper = {
  toResponse,
  toResponseList,
};
