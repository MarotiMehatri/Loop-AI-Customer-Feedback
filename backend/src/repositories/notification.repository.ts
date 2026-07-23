import { prisma } from "../lib/prisma.js";
import { Prisma, NotificationType } from "../generated/prisma/client.js";

export async function getNotifications(userId: string, skip: number, limit: number, isRead?: boolean) {
  const where: Prisma.NotificationWhereInput = { userId };
  if (isRead !== undefined) where.isRead = isRead;
  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });
}

export async function countNotifications(userId: string, isRead?: boolean) {
  const where: Prisma.NotificationWhereInput = { userId };
  if (isRead !== undefined) where.isRead = isRead;
  return prisma.notification.count({ where });
}

export async function getNotificationById(notificationId: string, userId: string) {
  return prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function createNotification(data: {
  userId: string;
  workspaceId: string;
  type: string;
  title: string;
  message: string;
  metadata: unknown;
  read: boolean;
}) {
  const { read, type, ...rest } = data;
  return prisma.notification.create({
    data: { ...rest, type: type as NotificationType, isRead: read, metadata: rest.metadata as any },
  });
}

export async function getDeliveryAlerts(userId: string, skip: number, limit: number) {
  return prisma.notification.findMany({
    where: { userId, type: NotificationType.DELIVERY_ALERT },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });
}

export async function countDeliveryAlerts(userId: string) {
  return prisma.notification.count({
    where: { userId, type: NotificationType.DELIVERY_ALERT },
  });
}

export async function getFailedNotifications(userId: string, skip: number, limit: number) {
  return prisma.notification.findMany({
    where: { userId, type: NotificationType.FAILED_DELIVERY },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });
}

export async function countFailedNotifications(userId: string) {
  return prisma.notification.count({
    where: { userId, type: NotificationType.FAILED_DELIVERY },
  });
}
