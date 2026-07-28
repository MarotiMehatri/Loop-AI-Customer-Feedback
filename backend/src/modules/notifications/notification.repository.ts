import type { Notification, Prisma } from "../../generated/prisma/client.js";

import { prisma } from "../../config/prisma.js";

import {
  NOTIFICATION_DEFAULT_LIMIT,
  NOTIFICATION_DEFAULT_PAGE,
  NOTIFICATION_MAX_LIMIT,
} from "./notification.constants.js";

import type {
  CreateNotificationInput,
  NotificationListQuery,
} from "./notification.types.js";

interface NotificationRepositoryListResult {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

function normalizePage(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) {
    return NOTIFICATION_DEFAULT_PAGE;
  }

  return Math.max(1, Math.trunc(value));
}

function normalizeLimit(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) {
    return NOTIFICATION_DEFAULT_LIMIT;
  }

  return Math.min(Math.max(1, Math.trunc(value)), NOTIFICATION_MAX_LIMIT);
}

function normalizeRequiredText(value: string, fieldName: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (!normalized) {
    throw new Error(`${fieldName} is required.`);
  }

  return normalized;
}

function buildUserWhere(
  workspaceId: string,
  userId: string,
  query: Pick<NotificationListQuery, "isRead" | "type"> = {},
): Prisma.NotificationWhereInput {
  return {
    workspaceId,
    userId,

    ...(query.isRead !== undefined
      ? {
          isRead: query.isRead,
        }
      : {}),

    ...(query.type !== undefined
      ? {
          type: query.type,
        }
      : {}),
  };
}

function toCreateData(
  input: CreateNotificationInput,
): Prisma.NotificationUncheckedCreateInput {
  const title = normalizeRequiredText(input.title, "Notification title");

  const message = normalizeRequiredText(input.message, "Notification message");

  return {
    userId: input.userId,

    workspaceId: input.workspaceId,

    type: input.type,

    title,
    message,

    metadata: input.metadata ?? {},

    isRead: false,

    readAt: null,

    ...(input.entityType !== undefined
      ? {
          entityType: input.entityType,
        }
      : {}),

    ...(input.entityId !== undefined
      ? {
          entityId: input.entityId,
        }
      : {}),

    ...(input.priority !== undefined
      ? {
          priority: input.priority,
        }
      : {}),
  };
}

async function list(
  workspaceId: string,
  userId: string,
  query: NotificationListQuery = {},
): Promise<NotificationRepositoryListResult> {
  const page = normalizePage(query.page);

  const limit = normalizeLimit(query.limit);

  const skip = (page - 1) * limit;

  const where = buildUserWhere(workspaceId, userId, query);

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,

      orderBy: {
        createdAt: "desc",
      },

      skip,
      take: limit,
    }),

    prisma.notification.count({
      where,
    }),

    prisma.notification.count({
      where: {
        workspaceId,
        userId,
        isRead: false,
      },
    }),
  ]);

  return {
    notifications,
    total,
    unreadCount,
    page,
    limit,

    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

async function countUnread(
  workspaceId: string,
  userId: string,
): Promise<number> {
  return prisma.notification.count({
    where: {
      workspaceId,
      userId,
      isRead: false,
    },
  });
}

async function findById(
  notificationId: string,
  workspaceId: string,
  userId: string,
): Promise<Notification | null> {
  return prisma.notification.findFirst({
    where: {
      id: notificationId,

      workspaceId,
      userId,
    },
  });
}

async function create(input: CreateNotificationInput): Promise<Notification> {
  return prisma.notification.create({
    data: toCreateData(input),
  });
}

async function createMany(
  inputs: CreateNotificationInput[],
): Promise<Prisma.BatchPayload> {
  if (inputs.length === 0) {
    return {
      count: 0,
    };
  }

  const data: Prisma.NotificationCreateManyInput[] = inputs.map((input) =>
    toCreateData(input),
  );

  return prisma.notification.createMany({
    data,
  });
}

async function markAsRead(
  notificationId: string,
  workspaceId: string,
  userId: string,
): Promise<Notification | null> {
  const result = await prisma.notification.updateMany({
    where: {
      id: notificationId,

      workspaceId,
      userId,
    },

    data: {
      isRead: true,

      readAt: new Date(),
    },
  });

  if (result.count === 0) {
    return null;
  }

  return findById(notificationId, workspaceId, userId);
}

async function markAsUnread(
  notificationId: string,
  workspaceId: string,
  userId: string,
): Promise<Notification | null> {
  const result = await prisma.notification.updateMany({
    where: {
      id: notificationId,

      workspaceId,
      userId,
    },

    data: {
      isRead: false,

      readAt: null,
    },
  });

  if (result.count === 0) {
    return null;
  }

  return findById(notificationId, workspaceId, userId);
}

async function markAllAsRead(
  workspaceId: string,
  userId: string,
): Promise<Prisma.BatchPayload> {
  return prisma.notification.updateMany({
    where: {
      workspaceId,
      userId,
      isRead: false,
    },

    data: {
      isRead: true,

      readAt: new Date(),
    },
  });
}

async function deleteById(
  notificationId: string,
  workspaceId: string,
  userId: string,
): Promise<Prisma.BatchPayload> {
  return prisma.notification.deleteMany({
    where: {
      id: notificationId,

      workspaceId,
      userId,
    },
  });
}

async function deleteRead(
  workspaceId: string,
  userId: string,
): Promise<Prisma.BatchPayload> {
  return prisma.notification.deleteMany({
    where: {
      workspaceId,
      userId,
      isRead: true,
    },
  });
}

async function clear(
  workspaceId: string,
  userId: string,
): Promise<Prisma.BatchPayload> {
  return prisma.notification.deleteMany({
    where: {
      workspaceId,
      userId,
    },
  });
}

export const notificationRepository = {
  list,
  countUnread,
  findById,
  create,
  createMany,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteById,
  deleteRead,
  clear,
};
