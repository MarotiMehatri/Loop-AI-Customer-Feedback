import { prisma } from "../../config/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";
import type { ListClassificationsQuery, SaveClassificationInput } from "./classification.types.js";

export const classificationRepository = {
  async save(input: SaveClassificationInput) {
    return prisma.feedback.update({
      where: { id: input.feedbackId },
      data: {
        sentiment: input.sentiment as never,
        category: input.category,
        tags: input.tags,
        aiCategory: input.category,
        aiConfidence: input.confidence,
        aiSummary: input.summary,
        isClassified: true,
        aiProcessedAt: new Date(),
      },
    });
  },

  async findById(classificationId: string, workspaceId: string) {
    return prisma.feedback.findFirst({
      where: {
        id: classificationId,
        workspaceId,
      },
    });
  },

  async list(workspaceId: string, query: ListClassificationsQuery) {
    const where: Prisma.FeedbackWhereInput = {
      workspaceId,
      isClassified: true,
    };

    if (query.sentiment) {
      where.sentiment = query.sentiment as never;
    }

    if (query.category) {
      where.category = {
        equals: query.category,
        mode: "insensitive",
      };
    }

    if (query.startDate || query.endDate) {
      where.aiProcessedAt = {
        ...(query.startDate ? { gte: query.startDate } : {}),
        ...(query.endDate ? { lte: query.endDate } : {}),
      };
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await prisma.$transaction([
      prisma.feedback.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { aiProcessedAt: "desc" },
        select: {
          id: true,
          content: true,
          sentiment: true,
          category: true,
          tags: true,
          aiCategory: true,
          aiConfidence: true,
          aiSummary: true,
          isClassified: true,
          aiProcessedAt: true,
          source: true,
          workspaceId: true,
        },
      }),
      prisma.feedback.count({ where }),
    ]);

    return { items, total };
  },

  async countByWorkspace(workspaceId: string) {
    return prisma.feedback.count({
      where: {
        workspaceId,
        isClassified: true,
      },
    });
  },

  async getUnclassifiedFeedback(
    workspaceId: string,
    limit: number = 10,
  ) {
    return prisma.feedback.findMany({
      where: {
        workspaceId,
        isClassified: false,
      },
      take: limit,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        source: true,
        workspaceId: true,
      },
    });
  },
};
