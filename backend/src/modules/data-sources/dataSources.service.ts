import { ApiError } from "../../utils/apiError.js";

import {
  createDataSourceRecord,
  deleteDataSourceRecord,
  findDataSourceById,
  findDataSourceList,
  updateDataSourceRecord,
  updateDataSourceStatus,
} from "./dataSources.repository.js";

import type {
  CreateDataSourceInput,
  DataSourceListFilters,
  PaginationMetadata,
  SyncResult,
  UpdateDataSourceInput,
} from "./dataSources.types.js";

export const createDataSource = async (
  input: CreateDataSourceInput,
  workspaceId: string,
  userId: string,
) => {
  const dataSource = await createDataSourceRecord({
    ...input,
    name: input.name.trim(),
    description: input.description?.trim(),
    workspaceId,
    createdById: userId,
  });

  return dataSource;
};

export const getDataSource = async (
  dataSourceId: string,
  workspaceId: string,
) => {
  const dataSource = await findDataSourceById(dataSourceId, workspaceId);

  if (!dataSource) {
    throw new ApiError(404, "Data source was not found");
  }

  return dataSource;
};

export const getDataSourceList = async (
  workspaceId: string,
  filters: DataSourceListFilters,
) => {
  const result = await findDataSourceList(workspaceId, filters);

  const totalPages = Math.ceil(result.totalItems / filters.limit);

  const pagination: PaginationMetadata = {
    page: filters.page,
    limit: filters.limit,
    totalItems: result.totalItems,
    totalPages,
    hasNextPage: filters.page < totalPages,
    hasPreviousPage: filters.page > 1,
  };

  return {
    dataSources: result.dataSources,
    pagination,
  };
};

export const updateDataSource = async (
  dataSourceId: string,
  workspaceId: string,
  input: UpdateDataSourceInput,
) => {
  await getDataSource(dataSourceId, workspaceId);

  const normalizedInput: UpdateDataSourceInput = {
    ...input,

    ...(input.name !== undefined
      ? { name: input.name.trim() }
      : {}),

    ...(input.description !== undefined
      ? { description: input.description?.trim() || null }
      : {}),
  };

  const dataSource = await updateDataSourceRecord(
    dataSourceId,
    workspaceId,
    normalizedInput,
  );

  return dataSource;
};

export const deleteDataSource = async (
  dataSourceId: string,
  workspaceId: string,
) => {
  await getDataSource(dataSourceId, workspaceId);

  await deleteDataSourceRecord(dataSourceId, workspaceId);
};

export const syncDataSource = async (
  dataSourceId: string,
  workspaceId: string,
): Promise<SyncResult> => {
  const dataSource = await getDataSource(dataSourceId, workspaceId);

  await updateDataSourceStatus(dataSourceId, workspaceId, "SYNCING");

  const startedAt = new Date();

  try {
    // Simulate sync process - replace with actual sync logic per data source type
    const recordsProcessed = 0;
    const recordsAdded = 0;
    const recordsUpdated = 0;

    await updateDataSourceStatus(dataSourceId, workspaceId, "ACTIVE");

    return {
      dataSourceId,
      status: "completed",
      recordsProcessed,
      recordsAdded,
      recordsUpdated,
      errors: [],
      startedAt,
      completedAt: new Date(),
    };
  } catch (error) {
    await updateDataSourceStatus(dataSourceId, workspaceId, "ERROR");

    return {
      dataSourceId,
      status: "failed",
      recordsProcessed: 0,
      recordsAdded: 0,
      recordsUpdated: 0,
      errors: [error instanceof Error ? error.message : "Sync failed"],
      startedAt,
      completedAt: new Date(),
    };
  }
};
