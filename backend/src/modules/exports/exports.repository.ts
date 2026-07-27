import { prisma } from "../../config/prisma.js";

import { Prisma } from "../../generated/prisma/client.js";

import type {
  CreateExportInput,
  ExportJob,
  ExportListFilters,
} from "./exports.types.js";

const exportInclude = {
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

interface CreateExportRepositoryInput extends CreateExportInput {
  workspaceId: string;
  createdById: string;
}

export const createExportRecord = async (
  input: CreateExportRepositoryInput,
) => {
  return prisma.exportJob.create({
    data: {
      name: input.name,
      format: input.format,
      type: input.type,
      filters: (input.filters ?? {}) as Prisma.InputJsonValue,
      status: "PENDING",
      workspaceId: input.workspaceId,
      createdById: input.createdById,
    },

    include: exportInclude,
  });
};

export const findExportById = async (
  exportId: string,
  workspaceId: string,
) => {
  return prisma.exportJob.findFirst({
    where: {
      id: exportId,
      workspaceId,
    },

    include: exportInclude,
  });
};

const createExportWhereInput = (
  workspaceId: string,
  filters: ExportListFilters,
): Prisma.ExportJobWhereInput => {
  const where: Prisma.ExportJobWhereInput = {
    workspaceId,
  };

  if (filters.format) {
    where.format = filters.format;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.search) {
    where.OR = [
      {
        name: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
    ];
  }

  return where;
};

export const findExportList = async (
  workspaceId: string,
  filters: ExportListFilters,
) => {
  const where = createExportWhereInput(workspaceId, filters);

  const skip = (filters.page - 1) * filters.limit;

  const orderBy: Prisma.ExportJobOrderByWithRelationInput = {
    [filters.sortBy]: filters.sortOrder,
  };

  const [exports, totalItems] = await prisma.$transaction([
    prisma.exportJob.findMany({
      where,
      skip,
      take: filters.limit,
      orderBy,
      include: exportInclude,
    }),

    prisma.exportJob.count({
      where,
    }),
  ]);

  return {
    exports,
    totalItems,
  };
};

export const updateExportRecord = async (
  exportId: string,
  workspaceId: string,
  data: Prisma.ExportJobUpdateInput,
) => {
  return prisma.exportJob.update({
    where: {
      id: exportId,
      workspaceId,
    },

    data,

    include: exportInclude,
  });
};

export const deleteExportRecord = async (
  exportId: string,
  workspaceId: string,
) => {
  return prisma.exportJob.delete({
    where: {
      id: exportId,
      workspaceId,
    },
  });
};
