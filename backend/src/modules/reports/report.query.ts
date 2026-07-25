import type { Prisma, ReportStatus } from "../../generated/prisma/client.js";

import type { ReportListQuery } from "./report.types.js";

export function buildReportWhere(
  workspaceId: string,
  query: ReportListQuery,
): Prisma.ReportWhereInput {
  const where: Prisma.ReportWhereInput = {
    workspaceId,
  };

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

  if (query.type) {
    where.type = query.type;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.startDate || query.endDate) {
    where.createdAt = {
      ...(query.startDate ? { gte: query.startDate } : {}),

      ...(query.endDate ? { lte: query.endDate } : {}),
    };
  }

  return where;
}

export function buildReportOrderBy(
  query: ReportListQuery,
): Prisma.ReportOrderByWithRelationInput {
  switch (query.sortBy) {
    case "title":
      return {
        title: query.sortOrder,
      };

    case "status":
      return {
        status: query.sortOrder,
      };

    case "updatedAt":
      return {
        updatedAt: query.sortOrder,
      };

    case "createdAt":
    default:
      return {
        createdAt: query.sortOrder,
      };
  }
}
