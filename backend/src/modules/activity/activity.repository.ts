import { Prisma } from "../../generated/prisma/client.js";

import { prisma } from "../../config/prisma.js";

import { buildActivityOrderBy, buildActivityWhere } from "./activity.query.js";

import type {
  ActivityListQuery,
  ActivitySummary,
  ClearActivityInput,
  CreateActivityInput,
  RecentActivityQuery,
} from "./activity.types.js";

const activityUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} satisfies Prisma.UserSelect;

function toJsonValue(value: Record<string, unknown>): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function createMetadata(
  input: CreateActivityInput,
): Prisma.InputJsonValue | undefined {
  const metadata: Record<string, unknown> = {
    ...(input.metadata ?? {}),
  };

  if (input.entityType) {
    metadata.entityType = input.entityType;
  }

  if (input.entityId) {
    metadata.entityId = input.entityId;
  }

  if (Object.keys(metadata).length === 0) {
    return undefined;
  }

  return toJsonValue(metadata);
}

export const activityRepository = {
  async create(input: CreateActivityInput) {
    return prisma.activityLog.create({
      data: {
        userId: input.userId,
        workspaceId: input.workspaceId,

        type: input.type,

        title: input.title,
        description: input.description,

        metadata: createMetadata(input),
      },

      include: {
        user: {
          select: activityUserSelect,
        },
      },
    });
  },

  async findById(activityId: string, workspaceId: string) {
    return prisma.activityLog.findFirst({
      where: {
        id: activityId,
        workspaceId,
      },

      include: {
        user: {
          select: activityUserSelect,
        },
      },
    });
  },

  async list(workspaceId: string, query: ActivityListQuery) {
    const where = buildActivityWhere(workspaceId, query);

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await prisma.$transaction([
      prisma.activityLog.findMany({
        where,
        skip,
        take: query.limit,

        orderBy: buildActivityOrderBy(query),

        include: {
          user: {
            select: activityUserSelect,
          },
        },
      }),

      prisma.activityLog.count({
        where,
      }),
    ]);

    return {
      items,
      total,
    };
  },

  async recent(workspaceId: string, query: RecentActivityQuery) {
    const where: Prisma.ActivityLogWhereInput = {
      workspaceId,
    };

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.type) {
      where.type = query.type;
    }

    return prisma.activityLog.findMany({
      where,

      take: query.limit,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        user: {
          select: activityUserSelect,
        },
      },
    });
  },

  async getSummary(
    workspaceId: string,
    userId?: string,
  ): Promise<ActivitySummary> {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const baseWhere: Prisma.ActivityLogWhereInput = {
      workspaceId,

      ...(userId
        ? {
            userId,
          }
        : {}),
    };

    const [total, today, last7Days, last30Days] = await prisma.$transaction([
      prisma.activityLog.count({
        where: baseWhere,
      }),

      prisma.activityLog.count({
        where: {
          ...baseWhere,

          createdAt: {
            gte: startOfToday,
          },
        },
      }),

      prisma.activityLog.count({
        where: {
          ...baseWhere,

          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),

      prisma.activityLog.count({
        where: {
          ...baseWhere,

          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
    ]);

    const groupedTypes = await prisma.activityLog.groupBy({
      by: ["type"],

      where: baseWhere,

      orderBy: {
        type: "asc",
      },

      _count: {
        id: true,
      },
    });

    return {
      total,
      today,
      last7Days,
      last30Days,

      byType: groupedTypes
        .map((item) => ({
          type: item.type,
          count: item._count?.id ?? 0,
        }))
        .sort((first, second) => second.count - first.count),
    };
  },

  async deleteById(activityId: string, workspaceId: string) {
    return prisma.activityLog.deleteMany({
      where: {
        id: activityId,
        workspaceId,
      },
    });
  },

  async clear(workspaceId: string, input: ClearActivityInput) {
    const where: Prisma.ActivityLogWhereInput = {
      workspaceId,
    };

    if (input.userId) {
      where.userId = input.userId;
    }

    if (input.beforeDate) {
      where.createdAt = {
        lt: input.beforeDate,
      };
    }

    return prisma.activityLog.deleteMany({
      where,
    });
  },
};
