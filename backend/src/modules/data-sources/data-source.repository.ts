import { prisma } from "../../config/prisma.js";

import { Prisma } from "../../generated/prisma/client.js";

import type {
  CreateDataSourceInput,
  DataSourceListFilters,
  UpdateDataSourceInput,
} from "./data-source.types.js";

interface CreateDataSourceRepositoryInput extends CreateDataSourceInput {
  workspaceId: string;
  createdById: string;
}

export const dataSourceRepository = {
  async create(input: CreateDataSourceRepositoryInput) {
    return prisma.dataSource.create({
      data: {
        name: input.name,
        type: input.type,
        description: input.description,
        config: input.config as Prisma.InputJsonValue,
        isActive: input.isActive ?? true,
        status: "INACTIVE",
        workspaceId: input.workspaceId,
        createdById: input.createdById,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  },

  async findById(dataSourceId: string, workspaceId: string) {
    return prisma.dataSource.findFirst({
      where: { id: dataSourceId, workspaceId },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  },

  async list(workspaceId: string, filters: DataSourceListFilters) {
    const where: Prisma.DataSourceWhereInput = { workspaceId };

    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const skip = (filters.page - 1) * filters.limit;

    const orderBy: Prisma.DataSourceOrderByWithRelationInput = {
      [filters.sortBy]: filters.sortOrder,
    };

    const [items, total] = await prisma.$transaction([
      prisma.dataSource.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.dataSource.count({ where }),
    ]);

    return { items, total };
  },

  async update(
    dataSourceId: string,
    workspaceId: string,
    input: UpdateDataSourceInput,
  ) {
    return prisma.dataSource.update({
      where: { id: dataSourceId, workspaceId },
      data: {
        name: input.name,
        type: input.type,
        description: input.description,
        config: input.config as Prisma.InputJsonValue | undefined,
        isActive: input.isActive,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  },

  async remove(dataSourceId: string, workspaceId: string) {
    return prisma.dataSource.delete({
      where: { id: dataSourceId, workspaceId },
    });
  },

  async updateStatus(
    dataSourceId: string,
    workspaceId: string,
    status: string,
  ) {
    return prisma.dataSource.update({
      where: { id: dataSourceId, workspaceId },
      data: {
        status: status as never,
        lastSyncAt: new Date(),
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  },
};
