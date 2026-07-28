import { prisma } from "../../config/prisma.js";

import type { Prisma } from "../../generated/prisma/client.js";

import type {
  AssignFeedbackInput,
  ThemeFeedbackQuery,
} from "./theme.types.js";

async function listFeedback(
  themeId: string,
  workspaceId: string,
  query: ThemeFeedbackQuery,
) {
  const where: Prisma.FeedbackThemeWhereInput = {
    themeId,
    theme: {
      workspaceId,
    },
  };

  const skip = (query.page - 1) * query.limit;

  const [items, total] = await prisma.$transaction([
    prisma.feedbackTheme.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: {
        feedback: {
          createdAt: "desc",
        },
      },
      select: {
        confidence: true,
        feedback: {
          select: {
            id: true,
            content: true,
            sentiment: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.feedbackTheme.count({
      where,
    }),
  ]);

  return {
    items,
    total,
  };
}

async function getAnalyticsRecords(themeId: string, workspaceId: string) {
  return prisma.feedbackTheme.findMany({
    where: {
      themeId,
      theme: {
        workspaceId,
      },
    },
    select: {
      confidence: true,
      feedback: {
        select: {
          id: true,
          content: true,
          sentiment: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      feedback: {
        createdAt: "asc",
      },
    },
  });
}

async function assignFeedback(
  themeId: string,
  feedbackId: string,
  workspaceId: string,
  input: AssignFeedbackInput,
) {
  const [theme, feedback] = await Promise.all([
    prisma.theme.findFirst({
      where: {
        id: themeId,
        workspaceId,
      },
      select: {
        id: true,
      },
    }),
    prisma.feedback.findFirst({
      where: {
        id: feedbackId,
        workspaceId,
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!theme) {
    return {
      status: "THEME_NOT_FOUND" as const,
    };
  }

  if (!feedback) {
    return {
      status: "FEEDBACK_NOT_FOUND" as const,
    };
  }

  await prisma.feedbackTheme.createMany({
    data: [
      {
        themeId,
        feedbackId,
        confidence: input.confidence ?? 1,
      },
    ],
    skipDuplicates: true,
  });

  return {
    status: "ASSIGNED" as const,
  };
}

async function removeFeedback(
  themeId: string,
  feedbackId: string,
  workspaceId: string,
) {
  const theme = await prisma.theme.findFirst({
    where: {
      id: themeId,
      workspaceId,
    },
    select: {
      id: true,
    },
  });

  if (!theme) {
    return {
      status: "THEME_NOT_FOUND" as const,
      count: 0,
    };
  }

  const result = await prisma.feedbackTheme.deleteMany({
    where: {
      themeId,
      feedbackId,
    },
  });

  return {
    status: "REMOVED" as const,
    count: result.count,
  };
}

export const themeFeedbackRepository = {
  listFeedback,
  getAnalyticsRecords,
  assignFeedback,
  removeFeedback,
};
