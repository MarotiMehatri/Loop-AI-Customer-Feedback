import { prisma } from "../../config/prisma.js";

import type { MessageRole, Prisma } from "../../generated/prisma/client.js";

import { ASK_LOOP_LIMITS } from "./askLoop.constants.js";

function buildFeedbackWhere(
  workspaceId: string,
  startDate?: Date,
  endDate?: Date,
): Prisma.FeedbackWhereInput {
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

export const askLoopRepository = {
  async findConversation(
    conversationId: string,
    workspaceId: string,
    userId: string,
  ) {
    return prisma.conversation.findFirst({
      where: {
        id: conversationId,
        workspaceId,
        userId,
      },
    });
  },

  async createConversation(workspaceId: string, userId: string, title: string) {
    return prisma.conversation.create({
      data: {
        workspaceId,
        userId,
        title,
      },
    });
  },

  async saveMessage(input: {
    conversationId: string;
    role: MessageRole;
    content: string;
    chart?: Prisma.InputJsonValue;
    metadata?: Prisma.InputJsonValue;
    promptTokens?: number;
    completionTokens?: number;
  }) {
    return prisma.conversationMessage.create({
      data: {
        conversationId: input.conversationId,
        role: input.role,
        content: input.content,
        chart: input.chart,
        metadata: input.metadata,
        promptTokens: input.promptTokens,
        completionTokens: input.completionTokens,
      },
    });
  },

  async getConversationMessages(conversationId: string) {
    return prisma.conversationMessage.findMany({
      where: {
        conversationId,
      },

      orderBy: {
        createdAt: "asc",
      },
    });
  },

  async getRecentConversationMessages(conversationId: string) {
    return prisma.conversationMessage.findMany({
      where: {
        conversationId,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: ASK_LOOP_LIMITS.HISTORY_MESSAGE_LIMIT,
    });
  },

  async listConversations(
    workspaceId: string,
    userId: string,
    page: number,
    limit: number,
  ) {
    const where = {
      workspaceId,
      userId,
    };

    const [items, total] = await Promise.all([
      prisma.conversation.findMany({
        where,

        orderBy: {
          updatedAt: "desc",
        },

        skip: (page - 1) * limit,

        take: limit,

        include: {
          _count: {
            select: {
              messages: true,
            },
          },
        },
      }),

      prisma.conversation.count({
        where,
      }),
    ]);

    return {
      items,
      total,
    };
  },

  async deleteConversation(
    conversationId: string,
    workspaceId: string,
    userId: string,
  ) {
    return prisma.conversation.deleteMany({
      where: {
        id: conversationId,
        workspaceId,
        userId,
      },
    });
  },

  async saveMessageFeedback(input: {
    messageId: string;
    userId: string;
    helpful: boolean;
    note?: string;
  }) {
    return prisma.aIMessageFeedback.upsert({
      where: {
        messageId_userId: {
          messageId: input.messageId,
          userId: input.userId,
        },
      },

      update: {
        helpful: input.helpful,
        note: input.note,
      },

      create: {
        messageId: input.messageId,
        userId: input.userId,
        helpful: input.helpful,
        note: input.note,
      },
    });
  },

  async getContext(workspaceId: string, startDate?: Date, endDate?: Date) {
    const where = buildFeedbackWhere(workspaceId, startDate, endDate);

    const [
      totalFeedback,
      sentiment,
      sources,
      categories,
      topThemes,
      recentFeedback,
    ] = await Promise.all([
      prisma.feedback.count({
        where,
      }),

      prisma.feedback.groupBy({
        by: ["sentiment"],
        where,

        _count: {
          id: true,
        },
      }),

      prisma.feedback.groupBy({
        by: ["source"],
        where,

        _count: {
          id: true,
        },
      }),

      prisma.feedback.groupBy({
        by: ["category"],
        where,

        _count: {
          id: true,
        },
      }),

      prisma.feedbackTheme.groupBy({
        by: ["themeId"],

        where: {
          feedback: where,
        },

        _count: {
          themeId: true,
        },

        orderBy: {
          _count: {
            themeId: "desc",
          },
        },

        take: 10,
      }),

      prisma.feedback.findMany({
        where,

        orderBy: {
          createdAt: "desc",
        },

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
            where: {
              id: {
                in: themeIds,
              },

              workspaceId,
            },

            select: {
              id: true,
              name: true,
            },
          })
        : [];

    const themeNameMap = new Map(themes.map((theme) => [theme.id, theme.name]));

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
};
