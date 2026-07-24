import type { Prisma } from "../../generated/prisma/client.js";
import type { AnalyticsQueryInput } from "./analytics.types.js";

export function buildFeedbackWhere(
  input: AnalyticsQueryInput,
): Prisma.FeedbackWhereInput {
  const where: Prisma.FeedbackWhereInput = {
    workspaceId: input.workspaceId,
    createdAt: { gte: input.startDate, lte: input.endDate },
  };

  if (input.source) where.source = input.source;
  if (input.sentiment) where.sentiment = input.sentiment;
  if (input.status) where.status = input.status;
  if (input.category)
    where.category = { equals: input.category, mode: "insensitive" };
  if (input.themeId)
    where.feedbackThemes = { some: { themeId: input.themeId } };

  return where;
}
