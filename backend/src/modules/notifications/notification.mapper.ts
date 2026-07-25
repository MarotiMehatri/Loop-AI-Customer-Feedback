import type { Notification } from "../../generated/prisma/client.js";

import type { NotificationResponse } from "./notification.types.js";

export function mapNotification(
  notification: Notification,
): NotificationResponse {
  return {
    id: notification.id,

    type: notification.type,
    priority: notification.priority,

    title: notification.title,
    message: notification.message,

    isRead: notification.isRead,
    readAt: notification.readAt,

    entityType: notification.entityType,
    entityId: notification.entityId,

    metadata: notification.metadata,

    userId: notification.userId,
    workspaceId: notification.workspaceId,

    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
}

export function mapNotifications(
  notifications: Notification[],
): NotificationResponse[] {
  return notifications.map(mapNotification);
}
