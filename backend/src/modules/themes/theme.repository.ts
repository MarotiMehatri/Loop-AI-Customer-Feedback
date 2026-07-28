import { Prisma } from "../../generated/prisma/client.js";

import { prisma } from "../../config/prisma.js";

import { buildThemeOrderBy, buildThemeWhere } from "./theme.query.js";

import type {
  CreateThemeInput,
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

export const themeRepository = {
  findById,
  findByName,
  create,
  update,
  remove,
  list,
  getSummary,
};
