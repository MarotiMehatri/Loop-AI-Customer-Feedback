import type { Prisma } from "../../generated/prisma/client.js";

import type { ActivityListQuery } from "./activity.types.js";

export function buildActivityWhere(
  workspaceId: string,
  query: ActivityListQuery,
): Prisma.ActivityLogWhereInput {
  const where: Prisma.ActivityLogWhereInput = {
    workspaceId,
  };

  if (query.userId) {
    where.userId = query.userId;
  }

  if (query.type) {
    where.type = query.type;
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
        description: {
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

export function buildActivityOrderBy(
  query: ActivityListQuery,
): Prisma.ActivityLogOrderByWithRelationInput {
  switch (query.sortBy) {
    case "title":
      return {
        title: query.sortOrder,
      };

    case "createdAt":
    default:
      return {
        createdAt: query.sortOrder,
      };
  }
}
