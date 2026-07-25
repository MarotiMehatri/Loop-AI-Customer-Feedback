import { Prisma } from "../../generated/prisma/client.js";

import { prisma } from "../../config/prisma.js";

import { buildThemeOrderBy, buildThemeWhere } from "./theme.query.js";

import type {
  AssignFeedbackInput,
  CreateThemeInput,
  ThemeAiCandidate,
  ThemeFeedbackQuery,
  ThemeListQuery,
  UpdateThemeInput,
} from "./theme.types.js";

const themeWithCountInclude = {
  _count: {
    select: {
      feedbackThemes: true,
    },
  },
} satisfies Prisma.ThemeInclude;

function buildCreateData(
  workspaceId: string,
  input: CreateThemeInput,
): Prisma.ThemeUncheckedCreateInput {
  return {
    workspaceId,
    name: input.name,
    description: input.description,
    color: input.color,
    status: input.status,
    isAiGenerated: false,
  };
}

function buildUpdateData(
  input: UpdateThemeInput,
): Prisma.ThemeUpdateManyMutationInput {
  return {
    name: input.name,
    description: input.description,
    color: input.color,
    status: input.status,
  };
}

async function findById(themeId: string, workspaceId: string) {
  return prisma.theme.findFirst({
    where: {
      id: themeId,
      workspaceId,
    },
    include: themeWithCountInclude,
  });
}

async function findByName(name: string, workspaceId: string) {
  return prisma.theme.findFirst({
    where: {
      workspaceId,
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
    include: themeWithCountInclude,
  });
}

async function create(workspaceId: string, input: CreateThemeInput) {
  return prisma.theme.create({
    data: buildCreateData(workspaceId, input),
    include: themeWithCountInclude,
  });
}

async function update(
  themeId: string,
  workspaceId: string,
  input: UpdateThemeInput,
) {
  const result = await prisma.theme.updateMany({
    where: {
      id: themeId,
      workspaceId,
    },
    data: buildUpdateData(input),
  });

  if (result.count === 0) {
    return null;
  }

  return findById(themeId, workspaceId);
}

async function remove(themeId: string, workspaceId: string) {
  return prisma.$transaction(async (transaction) => {
    const theme = await transaction.theme.findFirst({
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
        count: 0,
      };
    }

    await transaction.feedbackTheme.deleteMany({
      where: {
        themeId,
      },
    });

    return transaction.theme.deleteMany({
      where: {
        id: themeId,
        workspaceId,
      },
    });
  });
}

async function list(workspaceId: string, query: ThemeListQuery) {
  const where = buildThemeWhere(workspaceId, query);

  const skip = (query.page - 1) * query.limit;

  const [items, total] = await prisma.$transaction([
    prisma.theme.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: buildThemeOrderBy(query),
      include: themeWithCountInclude,
    }),
    prisma.theme.count({
      where,
    }),
  ]);

  return {
    items,
    total,
  };
}

async function getSummary(workspaceId: string) {
  const [
    totalThemes,
    aiGeneratedThemes,
    manuallyCreatedThemes,
    activeAssignments,
    groupedStatus,
  ] = await Promise.all([
    prisma.theme.count({
      where: {
        workspaceId,
      },
    }),
    prisma.theme.count({
      where: {
        workspaceId,
        isAiGenerated: true,
      },
    }),
    prisma.theme.count({
      where: {
        workspaceId,
        isAiGenerated: false,
      },
    }),
    prisma.feedbackTheme.count({
      where: {
        theme: {
          workspaceId,
        },
      },
    }),
    prisma.theme.groupBy({
      by: ["status"],
      where: {
        workspaceId,
      },
      orderBy: {
        status: "asc",
      },
      _count: {
        id: true,
      },
    }),
  ]);

  return {
    totalThemes,
    aiGeneratedThemes,
    manuallyCreatedThemes,
    activeAssignments,
    byStatus: groupedStatus.map((item) => ({
      status: item.status,
      count: item._count?.id ?? 0,
    })),
  };
}

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

async function findFeedbackForGeneration(workspaceId: string, limit: number) {
  return prisma.feedback.findMany({
    where: {
      workspaceId,
    },
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      content: true,
    },
  });
}

async function findExistingNames(workspaceId: string) {
  const themes = await prisma.theme.findMany({
    where: {
      workspaceId,
    },
    select: {
      name: true,
    },
  });

  return themes.map((theme) => theme.name);
}

async function createGeneratedBatch(
  workspaceId: string,
  candidates: ThemeAiCandidate[],
) {
  const themeIds = await prisma.$transaction(async (transaction) => {
    const resultIds: string[] = [];

    for (const candidate of candidates) {
      let theme = await transaction.theme.findFirst({
        where: {
          workspaceId,
          name: {
            equals: candidate.name,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
        },
      });

      if (!theme) {
        theme = await transaction.theme.create({
          data: {
            workspaceId,
            name: candidate.name,
            description: candidate.description,
            color: candidate.color,
            isAiGenerated: true,
          },
          select: {
            id: true,
          },
        });
      }

      const validFeedback = await transaction.feedback.findMany({
        where: {
          workspaceId,
          id: {
            in: candidate.feedbackIds,
          },
        },
        select: {
          id: true,
        },
      });

      if (validFeedback.length > 0) {
        await transaction.feedbackTheme.createMany({
          data: validFeedback.map((feedback) => ({
            themeId: theme.id,
            feedbackId: feedback.id,
            confidence: candidate.confidence,
          })),
          skipDuplicates: true,
        });
      }

      resultIds.push(theme.id);
    }

    return [...new Set(resultIds)];
  });

  if (themeIds.length === 0) {
    return [];
  }

  return prisma.theme.findMany({
    where: {
      workspaceId,
      id: {
        in: themeIds,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: themeWithCountInclude,
  });
}

export const themeRepository = {
  findById,
  findByName,
  create,
  update,
  remove,
  list,
  getSummary,
  listFeedback,
  getAnalyticsRecords,
  assignFeedback,
  removeFeedback,
  findFeedbackForGeneration,
  findExistingNames,
  createGeneratedBatch,
};
