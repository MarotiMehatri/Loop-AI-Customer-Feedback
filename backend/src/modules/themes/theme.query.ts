import type { Prisma } from "../../generated/prisma/client.js";

import type { ThemeListQuery } from "./theme.types.js";

export function buildThemeWhere(
  workspaceId: string,
  query: ThemeListQuery,
): Prisma.ThemeWhereInput {
  const where: Prisma.ThemeWhereInput = {
    workspaceId,
  };

  if (query.status) {
    where.status = query.status;
  }

  if (query.isAiGenerated !== undefined) {
    where.isAiGenerated = query.isAiGenerated;
  }

  if (query.search) {
    where.OR = [
      {
        name: {
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

  return where;
}

export function buildThemeOrderBy(
  query: ThemeListQuery,
): Prisma.ThemeOrderByWithRelationInput[] {
  switch (query.sortBy) {
    case "name":
      return [
        {
          name: query.sortOrder,
        },
        {
          createdAt: "desc",
        },
      ];

    case "status":
      return [
        {
          status: query.sortOrder,
        },
        {
          name: "asc",
        },
      ];

    case "updatedAt":
      return [
        {
          updatedAt: query.sortOrder,
        },
        {
          id: "desc",
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
