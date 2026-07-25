import type { Prisma } from "../../generated/prisma/client.js";

import type { NotificationListQuery } from "./notification.types.js";

export function buildNotificationWhere(
  userId: string,
  workspaceId: string,
  query: NotificationListQuery,
): Prisma.NotificationWhereInput {
  const where: Prisma.NotificationWhereInput = {
    userId,
    workspaceId,
  };

  if (query.type) {
    where.type = query.type;
  }

  if (query.priority) {
    where.priority = query.priority;
  }

  if (query.isRead !== undefined) {
    where.isRead = query.isRead;
  }

  if (query.search) {
    where.OR = [
      {
        title: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        message: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (query.startDate || query.endDate) {
    where.createdAt = {
      ...(query.startDate
        ? {
            gte: query.startDate,
          }
        : {}),

      ...(query.endDate
        ? {
            lte: query.endDate,
          }
        : {}),
    };
  }

  return where;
}

export function buildNotificationOrderBy(
  query: NotificationListQuery,
): Prisma.NotificationOrderByWithRelationInput[] {
  switch (query.sortBy) {
    case "title":
      return [
        {
          title: query.sortOrder,
        },
        {
          createdAt: "desc",
        },
      ];

    case "priority":
      return [
        {
          priority: query.sortOrder,
        },
        {
          createdAt: "desc",
        },
      ];

    case "createdAt":
    default:
      return [
        {
          createdAt: query.sortOrder,
        },
        {
          id: "desc",
        },
      ];
  }
}
