import * as notificationRepo from "../repositories/notification.repository.js";
import { ApiError } from "../utils/apiError.js";

export async function list(userId: string, page = 1, limit = 20, isRead?: boolean) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    notificationRepo.getNotifications(userId, skip, limit, isRead),
    notificationRepo.countNotifications(userId, isRead),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getUnreadCount(userId: string) {
  const count = await notificationRepo.countNotifications(userId, false);

  return { count };
}

export async function markRead(userId: string, notificationId: string) {
  const notification = await notificationRepo.getNotificationById(notificationId, userId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  await notificationRepo.markNotificationAsRead(notificationId, userId);
}

export async function markAllRead(userId: string) {
  await notificationRepo.markAllNotificationsAsRead(userId);
}

export async function createNotification(
  userId: string,
  workspaceId: string,
  type: string,
  title: string,
  message: string,
  metadata?: Record<string, unknown>,
) {
  const notification = await notificationRepo.createNotification({
    userId,
    workspaceId,
    type,
    title,
    message,
    metadata: metadata ?? null,
    read: false,
  });

  return notification;
}

export async function getDeliveryAlerts(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    notificationRepo.getDeliveryAlerts(userId, skip, limit),
    notificationRepo.countDeliveryAlerts(userId),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getFailedNotifications(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    notificationRepo.getFailedNotifications(userId, skip, limit),
    notificationRepo.countFailedNotifications(userId),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
