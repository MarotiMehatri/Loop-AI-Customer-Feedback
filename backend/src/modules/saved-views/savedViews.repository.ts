import { prisma } from "../../config/prisma.js";

import { Prisma } from "../../generated/prisma/client.js";

import type {
  CreateSavedViewInput,
  SavedViewListFilters,
  UpdateSavedViewInput,
} from "./savedViews.types.js";

const savedViewInclude = {
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

interface CreateSavedViewRepositoryInput extends CreateSavedViewInput {
  workspaceId: string;
  createdById: string;
}

export const createSavedViewRecord = async (
  input: CreateSavedViewRepositoryInput,
) => {
  return prisma.savedView.create({
    data: {
      name: input.name,
      filters: input.filters as Prisma.InputJsonValue,
      description: input.description,
      isDefault: input.isDefault ?? false,
      workspaceId: input.workspaceId,
      createdById: input.createdById,
    },

    include: savedViewInclude,
  });
};

export const findSavedViewById = async (
  viewId: string,
  workspaceId: string,
) => {
  return prisma.savedView.findFirst({
    where: {
      id: viewId,
      workspaceId,
    },

    include: savedViewInclude,
  });
};

const createSavedViewWhereInput = (
  workspaceId: string,
  filters: SavedViewListFilters,
): Prisma.SavedViewWhereInput => {
  const where: Prisma.SavedViewWhereInput = {
    workspaceId,
  };

  if (filters.search) {
    where.OR = [
      {
        name: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
    ];
  }

  return where;
};

export const findSavedViewList = async (
  workspaceId: string,
  filters: SavedViewListFilters,
) => {
  const where = createSavedViewWhereInput(workspaceId, filters);

  const skip = (filters.page - 1) * filters.limit;

  const orderBy: Prisma.SavedViewOrderByWithRelationInput = {
    [filters.sortBy]: filters.sortOrder,
  };

  const [views, totalItems] = await prisma.$transaction([
    prisma.savedView.findMany({
      where,
      skip,
      take: filters.limit,
      orderBy,
      include: savedViewInclude,
    }),

    prisma.savedView.count({
      where,
    }),
  ]);

  return {
    views,
    totalItems,
  };
};

export const updateSavedViewRecord = async (
  viewId: string,
  workspaceId: string,
  input: UpdateSavedViewInput,
) => {
  return prisma.savedView.update({
    where: {
      id: viewId,
      workspaceId,
    },

    data: {
      name: input.name,
      filters: input.filters as Prisma.InputJsonValue | undefined,
      description: input.description,
      isDefault: input.isDefault,
    },

    include: savedViewInclude,
  });
};

export const deleteSavedViewRecord = async (
  viewId: string,
  workspaceId: string,
) => {
  return prisma.savedView.delete({
    where: {
      id: viewId,
      workspaceId,
    },
  });
};
