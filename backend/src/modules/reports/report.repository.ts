import { Prisma, ReportStatus } from "../../generated/prisma/client.js";

import { prisma } from "../../config/prisma.js";

import { buildReportOrderBy, buildReportWhere } from "./report.query.js";

import type {
  CreateReportInput,
  ReportListQuery,
  UpdateReportInput,
} from "./report.types.js";

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export const reportRepository = {
  async create(workspaceId: string, userId: string, input: CreateReportInput) {
    return prisma.report.create({
      data: {
        title: input.title,
        description: input.description,
        type: input.type,
        status: ReportStatus.DRAFT,

        startDate: input.startDate,
        endDate: input.endDate,

        sources: jsonValue(input.sources),

        filters: input.filters ? jsonValue(input.filters) : undefined,

        metrics: jsonValue(input.metrics),

        charts: input.charts ? jsonValue(input.charts) : undefined,

        tags: input.tags ?? [],

        workspaceId,
        userId,
      },
    });
  },

  async findById(reportId: string, workspaceId: string) {
    return prisma.report.findFirst({
      where: {
        id: reportId,
        workspaceId,
      },
    });
  },

  async list(workspaceId: string, query: ReportListQuery) {
    const where = buildReportWhere(workspaceId, query);

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await prisma.$transaction([
      prisma.report.findMany({
        where,
        skip,
        take: query.limit,

        orderBy: buildReportOrderBy(query),
      }),

      prisma.report.count({
        where,
      }),
    ]);

    return {
      items,
      total,
    };
  },

  async update(
    reportId: string,
    workspaceId: string,
    input: UpdateReportInput,
  ) {
    const data: Prisma.ReportUpdateManyMutationInput = {};

    if (input.title !== undefined) {
      data.title = input.title;
    }

    if (input.description !== undefined) {
      data.description = input.description;
    }

    if (input.type !== undefined) {
      data.type = input.type;
    }

    if (input.status !== undefined) {
      data.status = input.status;
    }

    if (input.startDate !== undefined) {
      data.startDate = input.startDate;
    }

    if (input.endDate !== undefined) {
      data.endDate = input.endDate;
    }

    if (input.sources !== undefined) {
      data.sources = jsonValue(input.sources);
    }

    if (input.filters !== undefined) {
      data.filters = jsonValue(input.filters);
    }

    if (input.metrics !== undefined) {
      data.metrics = jsonValue(input.metrics);
    }

    if (input.charts !== undefined) {
      data.charts = jsonValue(input.charts);
    }

    if (input.tags !== undefined) {
      data.tags = input.tags;
    }

    if (input.scheduledAt !== undefined) {
      data.scheduledAt = input.scheduledAt;

      data.status = input.scheduledAt
        ? ReportStatus.SCHEDULED
        : ReportStatus.DRAFT;
    }

    const result = await prisma.report.updateMany({
      where: {
        id: reportId,
        workspaceId,
      },
      data,
    });

    if (result.count === 0) {
      return null;
    }

    return this.findById(reportId, workspaceId);
  },

  async updateGenerationStatus(
    reportId: string,
    workspaceId: string,
    input: {
      status: ReportStatus;
      data?: unknown;
      aiSummary?: string | null;
      generatedAt?: Date | null;
    },
  ) {
    const result = await prisma.report.updateMany({
      where: {
        id: reportId,
        workspaceId,
      },

      data: {
        status: input.status,

        data: input.data !== undefined ? jsonValue(input.data) : undefined,

        aiSummary: input.aiSummary,

        generatedAt: input.generatedAt,
      },
    });

    if (result.count === 0) {
      return null;
    }

    return this.findById(reportId, workspaceId);
  },

  async delete(reportId: string, workspaceId: string) {
    return prisma.report.deleteMany({
      where: {
        id: reportId,
        workspaceId,
      },
    });
  },

  async getDashboardSummary(workspaceId: string) {
    const [totalReports, completed, generating, scheduled, failed] =
      await prisma.$transaction([
        prisma.report.count({
          where: { workspaceId },
        }),

        prisma.report.count({
          where: {
            workspaceId,
            status: ReportStatus.COMPLETED,
          },
        }),

        prisma.report.count({
          where: {
            workspaceId,
            status: ReportStatus.GENERATING,
          },
        }),

        prisma.report.count({
          where: {
            workspaceId,
            status: ReportStatus.SCHEDULED,
          },
        }),

        prisma.report.count({
          where: {
            workspaceId,
            status: ReportStatus.FAILED,
          },
        }),
      ]);

    return {
      totalReports,
      completed,
      generating,
      scheduled,
      failed,
      downloads: 0,
    };
  },

  async getRecent(workspaceId: string, limit = 5) {
    return prisma.report.findMany({
      where: {
        workspaceId,
      },

      take: limit,

      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async getFeedbackForPreview(input: {
    workspaceId: string;
    startDate?: Date;
    endDate?: Date;
    sources?: string[];
    sentiments?: string[];
    search?: string;
  }) {
    const where: Prisma.FeedbackWhereInput = {
      workspaceId: input.workspaceId,
    };

    if (input.startDate || input.endDate) {
      where.createdAt = {
        ...(input.startDate ? { gte: input.startDate } : {}),

        ...(input.endDate ? { lte: input.endDate } : {}),
      };
    }

    if (input.sources && input.sources.length > 0) {
      where.source = {
        in: input.sources as never[],
      };
    }

    if (input.sentiments && input.sentiments.length > 0) {
      where.sentiment = {
        in: input.sentiments as never[],
      };
    }

    if (input.search) {
      where.content = {
        contains: input.search,
        mode: "insensitive",
      };
    }

    return prisma.feedback.findMany({
      where,

      select: {
        id: true,
        content: true,
        sentiment: true,
        source: true,
        createdAt: true,
      },

      orderBy: {
        createdAt: "asc",
      },
    });
  },
};
