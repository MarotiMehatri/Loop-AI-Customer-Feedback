import { prisma } from "../../config/prisma.js";
import { ANALYTICS_TOP_LIMIT } from "./analytics.constants.js";
import { buildFeedbackWhere } from "./analytics.query.js";
import type { AnalyticsQueryInput } from "./analytics.types.js";

export const analyticsRepository = {
  async getOverview(input: AnalyticsQueryInput) {
    const where = buildFeedbackWhere(input);
    const [totalFeedback, positive, neutral, negative, unresolved] =
      await prisma.$transaction([
        prisma.feedback.count({ where }),
        prisma.feedback.count({ where: { ...where, sentiment: "POSITIVE" } }),
        prisma.feedback.count({ where: { ...where, sentiment: "NEUTRAL" } }),
        prisma.feedback.count({ where: { ...where, sentiment: "NEGATIVE" } }),
        prisma.feedback.count({
          where: { ...where, status: { in: ["NEW", "REVIEWED"] } },
        }),
      ]);

    const grouped = await prisma.feedbackTheme.groupBy({
      by: ["themeId"],
      where: {
        feedback: where,
        theme: { workspaceId: input.workspaceId, status: "ACTIVE" },
      },
      _count: { themeId: true },
      orderBy: { _count: { themeId: "desc" } },
      take: 1,
    });

    let topTheme: { id: string; name: string; count: number } | null = null;
    if (grouped[0]) {
      const theme = await prisma.theme.findUnique({
        where: { id: grouped[0].themeId },
        select: { id: true, name: true },
      });
      if (theme) topTheme = { ...theme, count: grouped[0]._count.themeId };
    }

    return { totalFeedback, positive, neutral, negative, unresolved, topTheme };
  },

  getTrendRows(input: AnalyticsQueryInput) {
    return prisma.feedback.findMany({
      where: buildFeedbackWhere(input),
      select: { createdAt: true, sentiment: true },
      orderBy: { createdAt: "asc" },
    });
  },

  async getSentimentDistribution(input: AnalyticsQueryInput) {
    const rows = await prisma.feedback.groupBy({
      by: ["sentiment"],
      where: buildFeedbackWhere(input),
      _count: { sentiment: true },
      orderBy: { _count: { sentiment: "desc" } },
    });
    return rows.map((row) => ({
      key: row.sentiment,
      count: row._count.sentiment,
    }));
  },

  async getSourceDistribution(input: AnalyticsQueryInput) {
    const rows = await prisma.feedback.groupBy({
      by: ["source"],
      where: buildFeedbackWhere(input),
      _count: { source: true },
      orderBy: { _count: { source: "desc" } },
    });
    return rows.map((row) => ({ key: row.source, count: row._count.source }));
  },

  async getCategoryDistribution(input: AnalyticsQueryInput) {
    const rows = await prisma.feedback.groupBy({
      by: ["category"],
      where: { ...buildFeedbackWhere(input), category: { not: null } },
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
      take: ANALYTICS_TOP_LIMIT,
    });
    return rows
      .filter((row) => row.category !== null)
      .map((row) => ({
        key: row.category as string,
        count: row._count.category,
      }));
  },

  async getTopThemes(input: AnalyticsQueryInput) {
    const rows = await prisma.feedbackTheme.groupBy({
      by: ["themeId"],
      where: {
        feedback: buildFeedbackWhere(input),
        theme: { workspaceId: input.workspaceId, status: "ACTIVE" },
      },
      _count: { themeId: true },
      orderBy: { _count: { themeId: "desc" } },
      take: ANALYTICS_TOP_LIMIT,
    });
    const themes = await prisma.theme.findMany({
      where: { id: { in: rows.map((r) => r.themeId) } },
      select: { id: true, name: true },
    });
    const names = new Map(themes.map((theme) => [theme.id, theme.name]));
    return rows.map((row) => ({
      id: row.themeId,
      name: names.get(row.themeId) ?? "Unknown theme",
      count: row._count.themeId,
    }));
  },

  getHourlyRows(input: AnalyticsQueryInput) {
    return prisma.feedback.findMany({
      where: buildFeedbackWhere(input),
      select: { createdAt: true },
    });
  },

  getExportRows(input: AnalyticsQueryInput) {
    return prisma.feedback.findMany({
      where: buildFeedbackWhere(input),
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        content: true,
        source: true,
        sentiment: true,
        status: true,
        category: true,
        tags: true,
        isImportant: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
