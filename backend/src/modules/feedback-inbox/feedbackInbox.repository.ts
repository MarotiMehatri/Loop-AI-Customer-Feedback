import type { FeedbackStatus, Prisma } from "../../generated/prisma/client.js";

import { prisma } from "../../config/prisma.js";

import type {
  FeedbackInboxQuery,
  UpdateFeedbackInboxInput,
} from "./feedbackInbox.types.js";

const buildFeedbackWhere = (
  workspaceId: string,
  query: FeedbackInboxQuery,
): Prisma.FeedbackWhereInput => {
  const where: Prisma.FeedbackWhereInput = {
    workspaceId,
  };

  if (query.search) {
    where.OR = [
      {
        content: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        customerName: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        customerEmail: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (query.source) {
    where.source = query.source;
  }

  if (query.sentiment) {
    where.sentiment = query.sentiment;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.startDate || query.endDate) {
    where.createdAt = {};

    if (query.startDate) {
      where.createdAt.gte = query.startDate;
    }

    if (query.endDate) {
      const endOfDay = new Date(query.endDate);

      endOfDay.setHours(23, 59, 59, 999);

      where.createdAt.lte = endOfDay;
    }
  }

  return where;
};

export const findFeedbackInboxItems = async (
  workspaceId: string,
  query: FeedbackInboxQuery,
) => {
  const where = buildFeedbackWhere(workspaceId, query);

  const skip = (query.page - 1) * query.limit;

  const [items, total] = await prisma.$transaction([
    prisma.feedback.findMany({
      where,
      skip,
      take: query.limit,

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        content: true,
        source: true,
        sentiment: true,
        status: true,
        customerName: true,
        customerEmail: true,
        createdAt: true,
        updatedAt: true,

        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    }),

    prisma.feedback.count({
      where,
    }),
  ]);

  return {
    items,
    total,
  };
};

export const findFeedbackInboxById = (
  feedbackId: string,
  workspaceId: string,
) => {
  return prisma.feedback.findFirst({
    where: {
      id: feedbackId,
      workspaceId,
    },

    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });
};

export const findFeedbackInboxSummary = async (workspaceId: string) => {
  const [totalFeedback, positive, neutral, negative, unresolved] =
    await prisma.$transaction([
      prisma.feedback.count({
        where: {
          workspaceId,
        },
      }),

      prisma.feedback.count({
        where: {
          workspaceId,
          sentiment: "POSITIVE",
        },
      }),

      prisma.feedback.count({
        where: {
          workspaceId,
          sentiment: "NEUTRAL",
        },
      }),

      prisma.feedback.count({
        where: {
          workspaceId,
          sentiment: "NEGATIVE",
        },
      }),

      prisma.feedback.count({
        where: {
          workspaceId,

          status: {
            not: "ACTIONED",
          },
        },
      }),
    ]);

  return {
    totalFeedback,
    positive,
    neutral,
    negative,
    unresolved,
  };
};

export const updateFeedbackInboxRecord = (
  feedbackId: string,
  data: UpdateFeedbackInboxInput,
) => {
  return prisma.feedback.update({
    where: {
      id: feedbackId,
    },

    data,
  });
};

export const updateFeedbackInboxStatusRecord = (
  feedbackId: string,
  status: FeedbackStatus,
) => {
  return prisma.feedback.update({
    where: {
      id: feedbackId,
    },

    data: {
      status,
    },
  });
};

export const deleteFeedbackInboxRecord = (feedbackId: string) => {
  return prisma.feedback.delete({
    where: {
      id: feedbackId,
    },
  });
};
