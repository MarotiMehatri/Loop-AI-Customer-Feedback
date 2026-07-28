import { prisma } from "../../config/prisma.js";

import type { ThemeAiCandidate } from "./theme.types.js";

const themeWithCountInclude = {
  _count: {
    select: {
      feedbackThemes: true,
    },
  },
} as const;

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

export const themeGenerationRepository = {
  findFeedbackForGeneration,
  findExistingNames,
  createGeneratedBatch,
};
