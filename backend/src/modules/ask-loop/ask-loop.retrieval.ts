import { prisma } from "../../config/prisma.js";
import type { AskLoopContext, RetrievalOptions } from "./ask-loop.types.js";
import { ASK_LOOP_LIMITS } from "./ask-loop.constants.js";

function buildFeedbackWhere(
  workspaceId: string,
  startDate?: Date,
  endDate?: Date,
) {
  return {
    workspaceId,
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
  };
}

export const askLoopRetrieval = {
  async getContext(
    workspaceId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AskLoopContext> {
    const where = buildFeedbackWhere(workspaceId, startDate, endDate);

    const [totalFeedback, sentiment, sources, categories, topThemes, recentFeedback] =
      await Promise.all([
        prisma.feedback.count({ where }),

        prisma.feedback.groupBy({
          by: ["sentiment"],
          where,
          _count: { id: true },
        }),

        prisma.feedback.groupBy({
          by: ["source"],
          where,
          _count: { id: true },
        }),

        prisma.feedback.groupBy({
          by: ["category"],
          where,
          _count: { id: true },
        }),

        prisma.feedbackTheme.groupBy({
          by: ["themeId"],
          where: { feedback: where },
          _count: { themeId: true },
          orderBy: { _count: { themeId: "desc" } },
          take: 10,
        }),

        prisma.feedback.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: ASK_LOOP_LIMITS.CONTEXT_FEEDBACK_LIMIT,
          select: {
            id: true,
            content: true,
            sentiment: true,
            source: true,
            category: true,
            createdAt: true,
          },
        }),
      ]);

    const themeIds = topThemes.map((item) => item.themeId);
    const themes =
      themeIds.length > 0
        ? await prisma.theme.findMany({
            where: { id: { in: themeIds }, workspaceId },
            select: { id: true, name: true },
          })
        : [];

    const themeNameMap = new Map(themes.map((t) => [t.id, t.name]));

    return {
      totalFeedback,
      sentiment: sentiment.map((item) => ({
        sentiment: String(item.sentiment),
        count: item._count.id,
      })),
      sources: sources.map((item) => ({
        source: String(item.source),
        count: item._count.id,
      })),
      categories: categories.map((item) => ({
        category: item.category ?? "Uncategorized",
        count: item._count.id,
      })),
      themes: topThemes.map((item) => ({
        name: themeNameMap.get(item.themeId) ?? "Unknown theme",
        count: item._count.themeId,
      })),
      recentFeedback: recentFeedback.map((item) => ({
        ...item,
        sentiment: item.sentiment ? String(item.sentiment) : null,
        source: String(item.source),
      })),
    };
  },

  async searchFeedback(options: RetrievalOptions) {
    const { workspaceId, startDate, endDate, limit = 10 } = options;

    const where = buildFeedbackWhere(workspaceId, startDate, endDate);

    return prisma.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        content: true,
        sentiment: true,
        source: true,
        category: true,
        createdAt: true,
      },
    });
  },

  async getTopThemes(workspaceId: string, startDate?: Date, endDate?: Date) {
    const where = buildFeedbackWhere(workspaceId, startDate, endDate);

    const topThemeGroups = await prisma.feedbackTheme.groupBy({
      by: ["themeId"],
      where: { feedback: where },
      _count: { themeId: true },
      orderBy: { _count: { themeId: "desc" } },
      take: 10,
    });

    const themeIds = topThemeGroups.map((g) => g.themeId);
    if (themeIds.length === 0) return [];

    const themes = await prisma.theme.findMany({
      where: { id: { in: themeIds }, workspaceId },
      select: { id: true, name: true },
    });

    const nameMap = new Map(themes.map((t) => [t.id, t.name]));

    return topThemeGroups.map((g) => ({
      themeId: g.themeId,
      name: nameMap.get(g.themeId) ?? "Unknown",
      count: g._count.themeId,
    }));
  },
};
