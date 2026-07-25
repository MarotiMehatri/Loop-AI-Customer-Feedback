import { Prisma } from "../../generated/prisma/client.js";

import { prisma } from "../../config/prisma.js";

import {
  buildNotificationOrderBy,
  buildNotificationWhere,
} from "./notification.query.js";

import type {
  CreateNotificationInput,
  NotificationClearQuery,
  NotificationListQuery,
} from "./notification.types.js";

function toJsonValue(value: Record<string, unknown>): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function buildCreateData(
  input: CreateNotificationInput,
): Prisma.NotificationUncheckedCreateInput {
  return {
    userId: input.userId,
    workspaceId: input.workspaceId,

    type: input.type,
    priority: input.priority ?? "NORMAL",

    title: input.title,
    message: input.message,

    entityType: input.entityType,
    entityId: input.entityId,

    metadata: input.metadata ? toJsonValue(input.metadata) : undefined,
  };
}

async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: buildCreateData(input),
  });
}

async function createManyNotifications(inputs: CreateNotificationInput[]) {
  if (inputs.length === 0) {
    return [];
  }

  const operations = inputs.map((input) =>
    prisma.notification.create({
      data: buildCreateData(input),
    }),
  );

  return prisma.$transaction(operations);
}

async function findNotificationById(
  notificationId: string,
  userId: string,
  workspaceId: string,
) {
  return prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
      workspaceId,
    },
  });
}

async function listNotifications(
  userId: string,
  workspaceId: string,
  query: NotificationListQuery,
) {
  const where = buildNotificationWhere(userId, workspaceId, query);

  const skip = (query.page - 1) * query.limit;

  const [items, total] = await prisma.$transaction([
    prisma.notification.findMany({
      where,

      skip,
      take: query.limit,

      orderBy: buildNotificationOrderBy(query),
    }),

    prisma.notification.count({
      where,
    }),
  ]);

  return {
    items,
    total,
  };
}

async function countUnreadNotifications(userId: string, workspaceId: string) {
  return prisma.notification.count({
    where: {
      userId,
      workspaceId,
      isRead: false,
    },
  });
}

async function markNotificationAsRead(
  notificationId: string,
  userId: string,
  workspaceId: string,
) {
  const result = await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
      workspaceId,
    },

    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  if (result.count === 0) {
    return null;
  }

  return findNotificationById(notificationId, userId, workspaceId);
}

async function markAllNotificationsAsRead(userId: string, workspaceId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      workspaceId,
      isRead: false,
    },

    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

async function deleteNotificationById(
  notificationId: string,
  userId: string,
  workspaceId: string,
) {
  return prisma.notification.deleteMany({
    where: {
      id: notificationId,
      userId,
      workspaceId,
    },
  });
}

async function clearNotifications(
  userId: string,
  workspaceId: string,
  query: NotificationClearQuery,
) {
  const where: Prisma.NotificationWhereInput = {
    userId,
    workspaceId,
  };

  if (query.onlyRead ?? true) {
    where.isRead = true;
  }

  if (query.beforeDate) {
    where.createdAt = {
      lt: query.beforeDate,
    };
  }

  return prisma.notification.deleteMany({
    where,
  });
}

export const notificationRepository = {
  create: createNotification,

  createMany: createManyNotifications,

  findById: findNotificationById,

  list: listNotifications,

  countUnread: countUnreadNotifications,

  markAsRead: markNotificationAsRead,

  markAllAsRead: markAllNotificationsAsRead,

  deleteById: deleteNotificationById,

  clear: clearNotifications,
};
