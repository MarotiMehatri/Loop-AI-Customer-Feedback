import { prisma } from "../../config/prisma.js";

import { Prisma } from "../../generated/prisma/client.js";

import type {
  CreateExportInput,
  ExportListFilters,
} from "./export.types.js";

interface CreateExportRepositoryInput extends CreateExportInput {
  workspaceId: string;
  createdById: string;
}

export const exportRepository = {
  async create(input: CreateExportRepositoryInput) {
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
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  },

  async findById(exportId: string, workspaceId: string) {
    return prisma.exportJob.findFirst({
      where: { id: exportId, workspaceId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  },

  async list(workspaceId: string, filters: ExportListFilters) {
    const where: Prisma.ExportJobWhereInput = { workspaceId };

    if (filters.format) where.format = filters.format;
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const skip = (filters.page - 1) * filters.limit;

    const orderBy: Prisma.ExportJobOrderByWithRelationInput = {
      [filters.sortBy]: filters.sortOrder,
    };

    const [items, total] = await prisma.$transaction([
      prisma.exportJob.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy,
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.exportJob.count({ where }),
    ]);

    return { items, total };
  },

  async update(
    exportId: string,
    workspaceId: string,
    data: Prisma.ExportJobUpdateInput,
  ) {
    return prisma.exportJob.update({
      where: { id: exportId, workspaceId },
      data,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  },

  async remove(exportId: string, workspaceId: string) {
    return prisma.exportJob.delete({
      where: { id: exportId, workspaceId },
    });
  },
};
