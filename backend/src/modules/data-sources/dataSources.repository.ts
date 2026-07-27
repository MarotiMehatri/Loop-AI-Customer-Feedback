import { prisma } from "../../config/prisma.js";

import { Prisma } from "../../generated/prisma/client.js";

import type {
  CreateDataSourceInput,
  DataSourceListFilters,
  UpdateDataSourceInput,
} from "./dataSources.types.js";

const dataSourceInclude = {
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

interface CreateDataSourceRepositoryInput extends CreateDataSourceInput {
  workspaceId: string;
  createdById: string;
}

export const createDataSourceRecord = async (
  input: CreateDataSourceRepositoryInput,
) => {
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

    include: dataSourceInclude,
  });
};

export const findDataSourceById = async (
  dataSourceId: string,
  workspaceId: string,
) => {
  return prisma.dataSource.findFirst({
    where: {
      id: dataSourceId,
      workspaceId,
    },

    include: dataSourceInclude,
  });
};

const createDataSourceWhereInput = (
  workspaceId: string,
  filters: DataSourceListFilters,
): Prisma.DataSourceWhereInput => {
  const where: Prisma.DataSourceWhereInput = {
    workspaceId,
  };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.status) {
    where.status = filters.status;
  }

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

export const findDataSourceList = async (
  workspaceId: string,
  filters: DataSourceListFilters,
) => {
  const where = createDataSourceWhereInput(workspaceId, filters);

  const skip = (filters.page - 1) * filters.limit;

  const orderBy: Prisma.DataSourceOrderByWithRelationInput = {
    [filters.sortBy]: filters.sortOrder,
  };

  const [dataSources, totalItems] = await prisma.$transaction([
    prisma.dataSource.findMany({
      where,
      skip,
      take: filters.limit,
      orderBy,
      include: dataSourceInclude,
    }),

    prisma.dataSource.count({
      where,
    }),
  ]);

  return {
    dataSources,
    totalItems,
  };
};

export const updateDataSourceRecord = async (
  dataSourceId: string,
  workspaceId: string,
  input: UpdateDataSourceInput,
) => {
  return prisma.dataSource.update({
    where: {
      id: dataSourceId,
      workspaceId,
    },

    data: {
      name: input.name,
      type: input.type,
      description: input.description,
      config: input.config as Prisma.InputJsonValue | undefined,
      isActive: input.isActive,
    },

    include: dataSourceInclude,
  });
};

export const deleteDataSourceRecord = async (
  dataSourceId: string,
  workspaceId: string,
) => {
  return prisma.dataSource.delete({
    where: {
      id: dataSourceId,
      workspaceId,
    },
  });
};

export const updateDataSourceStatus = async (
  dataSourceId: string,
  workspaceId: string,
  status: string,
) => {
  return prisma.dataSource.update({
    where: {
      id: dataSourceId,
      workspaceId,
    },

    data: {
      status: status as never,
      lastSyncAt: new Date(),
    },

    include: dataSourceInclude,
  });
};
