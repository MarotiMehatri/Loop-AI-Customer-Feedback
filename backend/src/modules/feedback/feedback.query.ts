import type { Prisma } from "../../generated/prisma/client.js";
import type { FeedbackListFilters } from "./feedback.types.js";

export function buildFeedbackWhere(
  workspaceId: string,
  filters: Partial<FeedbackListFilters>,
): Prisma.FeedbackWhereInput {
  const where: Prisma.FeedbackWhereInput = { workspaceId };

  if (filters.source) where.source = filters.source;
  if (filters.sentiment) where.sentiment = filters.sentiment;
  if (filters.status) where.status = filters.status;

  if (filters.category) {
    where.category = { equals: filters.category, mode: "insensitive" };
  }

  if (filters.isImportant !== undefined) {
    where.isImportant = filters.isImportant;
  }

  if (filters.createdFrom || filters.createdTo) {
    where.createdAt = {
      ...(filters.createdFrom ? { gte: filters.createdFrom } : {}),
      ...(filters.createdTo ? { lte: filters.createdTo } : {}),
    };
  }

  if (filters.search) {
    where.OR = [
      { content: { contains: filters.search, mode: "insensitive" } },
      { customerName: { contains: filters.search, mode: "insensitive" } },
      { customerEmail: { contains: filters.search, mode: "insensitive" } },
      { category: { contains: filters.search, mode: "insensitive" } },
      { tags: { has: filters.search } },
    ];
  }

  return where;
}

export function buildFeedbackOrderBy(
  sortBy: string = "createdAt",
  sortOrder: "asc" | "desc" = "desc",
): Prisma.FeedbackOrderByWithRelationInput {
  const allowedFields = ["createdAt", "updatedAt", "customerName", "status", "sentiment", "source"];
  const field = allowedFields.includes(sortBy) ? sortBy : "createdAt";
  return { [field]: sortOrder };
}

export function buildFeedbackSelect() {
  return {
    id: true,
    source: true,
    sentiment: true,
    status: true,
    customerName: true,
    customerEmail: true,
    content: true,
    tags: true,
    category: true,
    isImportant: true,
    workspaceId: true,
    createdById: true,
    createdAt: true,
    updatedAt: true,
    createdBy: {
      select: { id: true, name: true, email: true, avatarUrl: true },
    },
  } as const;
}
