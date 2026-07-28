import { prisma } from "../../config/prisma.js";
import { TREND_DEFAULT_LIMIT } from "./trend.constants.js";
import { buildTrendOrderBy, buildTrendWhere } from "./trend.query.js";
import type { TrendFilterQuery } from "./trends.types.js";

export const trendRepository = {
  async getTrendData(
    workspaceId: string,
    field: "createdAt",
    query: TrendFilterQuery,
  ) {
    const where = buildTrendWhere(workspaceId, query);

    return prisma.feedback.findMany({
      where,
      select: { createdAt: true, sentiment: true },
      orderBy: buildTrendOrderBy("createdAt", "asc"),
    });
  },

  async getFeedbackCountByDate(
    workspaceId: string,
    query: TrendFilterQuery,
  ) {
    const where = buildTrendWhere(workspaceId, query);

    return prisma.feedback.findMany({
      where,
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });
  },

  async getSentimentCountByDate(
    workspaceId: string,
    query: TrendFilterQuery,
  ) {
    const where = buildTrendWhere(workspaceId, query);

    return prisma.feedback.findMany({
      where,
      select: { createdAt: true, sentiment: true },
      orderBy: { createdAt: "asc" },
    });
  },

  async getCategoryCountByDate(
    workspaceId: string,
    query: TrendFilterQuery,
  ) {
    const where = buildTrendWhere(workspaceId, query);

    return prisma.feedback.findMany({
      where,
      select: { createdAt: true, category: true },
      orderBy: { createdAt: "asc" },
    });
  },

  async getSourceDistribution(
    workspaceId: string,
    query: TrendFilterQuery,
  ) {
    const where = buildTrendWhere(workspaceId, query);

    return prisma.feedback.groupBy({
      by: ["source"],
      where,
      _count: { source: true },
      orderBy: { _count: { source: "desc" } },
    });
  },

  async getCategoryDistribution(
    workspaceId: string,
    query: TrendFilterQuery,
    limit: number = TREND_DEFAULT_LIMIT,
  ) {
    const where = {
      ...buildTrendWhere(workspaceId, query),
      category: { not: null },
    };

    return prisma.feedback.groupBy({
      by: ["category"],
      where,
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
      take: limit,
    });
  },

  async getSentimentDistribution(
    workspaceId: string,
    query: TrendFilterQuery,
  ) {
    const where = buildTrendWhere(workspaceId, query);

    return prisma.feedback.groupBy({
      by: ["sentiment"],
      where,
      _count: { sentiment: true },
      orderBy: { _count: { sentiment: "desc" } },
    });
  },

  async getCount(workspaceId: string, query: TrendFilterQuery) {
    const where = buildTrendWhere(workspaceId, query);

    return prisma.feedback.count({ where });
  },

  async getDateRange(workspaceId: string) {
    const result = await prisma.feedback.aggregate({
      where: { workspaceId },
      _min: { createdAt: true },
      _max: { createdAt: true },
    });

    return {
      earliest: result._min.createdAt,
      latest: result._max.createdAt,
    };
  },

  async getPeriodOverPeriod(
    workspaceId: string,
    currentStart: Date,
    currentEnd: Date,
    previousStart: Date,
    previousEnd: Date,
  ) {
    const [currentCount, previousCount] = await Promise.all([
      prisma.feedback.count({
        where: {
          workspaceId,
          createdAt: { gte: currentStart, lte: currentEnd },
        },
      }),
      prisma.feedback.count({
        where: {
          workspaceId,
          createdAt: { gte: previousStart, lte: previousEnd },
        },
      }),
    ]);

    return { currentCount, previousCount };
  },

  async getSentimentPeriodOverPeriod(
    workspaceId: string,
    currentStart: Date,
    currentEnd: Date,
    previousStart: Date,
    previousEnd: Date,
  ) {
    const [currentCounts, previousCounts] = await Promise.all([
      prisma.feedback.groupBy({
        by: ["sentiment"],
        where: {
          workspaceId,
          createdAt: { gte: currentStart, lte: currentEnd },
        },
        _count: { sentiment: true },
      }),
      prisma.feedback.groupBy({
        by: ["sentiment"],
        where: {
          workspaceId,
          createdAt: { gte: previousStart, lte: previousEnd },
        },
        _count: { sentiment: true },
      }),
    ]);

    return { currentCounts, previousCounts };
  },
};
