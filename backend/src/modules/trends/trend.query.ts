import type { Prisma } from "../../generated/prisma/client.js";
import { $Enums } from "../../generated/prisma/client.js";

import type { TrendFilterQuery } from "./trends.types.js";

export function buildTrendWhere(
  workspaceId: string,
  query: TrendFilterQuery,
): Prisma.FeedbackWhereInput {
  const where: Prisma.FeedbackWhereInput = {
    workspaceId,
  };

  if (query.source) {
    where.source = query.source as $Enums.FeedbackChannel;
  }

  if (query.sentiment) {
    where.sentiment = query.sentiment as $Enums.Sentiment;
  }

  if (query.category) {
    where.category = {
      equals: query.category,
      mode: "insensitive",
    };
  }

  if (query.status) {
    where.status = query.status as $Enums.FeedbackStatus;
  }

  if (query.startDate || query.endDate) {
    where.createdAt = {
      ...(query.startDate ? { gte: query.startDate } : {}),
      ...(query.endDate ? { lte: query.endDate } : {}),
    };
  }

  return where;
}

export function buildTrendOrderBy(
  sortBy?: string,
  sortOrder?: "asc" | "desc",
): Prisma.FeedbackOrderByWithRelationInput {
  switch (sortBy) {
    case "createdAt":
    default:
      return {
        createdAt: sortOrder ?? "asc",
      };
  }
}
