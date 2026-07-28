import { ApiError } from "../../utils/apiError.js";

import {
  assertCanManageDataSources,
  assertCanReadDataSources,
  assertCanDeleteDataSources,
} from "./data-source.permissions.js";

import { dataSourceRepository } from "./data-source.repository.js";

import { mapDataSource, mapDataSourceList } from "./data-source.mapper.js";

import { dataSourceSyncService } from "./data-source-sync.service.js";

import { DATA_SOURCE_MESSAGES } from "./data-source.constants.js";

import type {
  CreateDataSourceInput,
  DataSourceActorContext,
  DataSourceListFilters,
  UpdateDataSourceInput,
} from "./data-source.types.js";

export const dataSourceService = {
  async create(actor: DataSourceActorContext, input: CreateDataSourceInput) {
    assertCanManageDataSources(actor.role);

    const source = await dataSourceRepository.create({
      ...input,
      name: input.name.trim(),
      description: input.description?.trim(),
      workspaceId: actor.workspaceId,
      createdById: actor.userId,
    });

    return mapDataSource(source);
  },

  async getById(actor: DataSourceActorContext, dataSourceId: string) {
    assertCanReadDataSources(actor.role);

    const source = await dataSourceRepository.findById(
      dataSourceId,
      actor.workspaceId,
    );

    if (!source) {
      throw new ApiError(404, DATA_SOURCE_MESSAGES.notFound);
    }

    return mapDataSource(source);
  },

  async list(actor: DataSourceActorContext, filters: DataSourceListFilters) {
    assertCanReadDataSources(actor.role);

    const result = await dataSourceRepository.list(actor.workspaceId, filters);

    const totalPages = Math.ceil(result.total / filters.limit);

    return {
      dataSources: mapDataSourceList(result.items),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        totalItems: result.total,
        totalPages,
        hasNextPage: filters.page < totalPages,
        hasPreviousPage: filters.page > 1,
      },
    };
  },

  async update(
    actor: DataSourceActorContext,
    dataSourceId: string,
    input: UpdateDataSourceInput,
  ) {
    assertCanManageDataSources(actor.role);

    await this.getById(actor, dataSourceId);

    const normalizedInput: UpdateDataSourceInput = {
      ...input,
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
    };

    const source = await dataSourceRepository.update(
      dataSourceId,
      actor.workspaceId,
      normalizedInput,
    );

    return mapDataSource(source);
  },

  async remove(actor: DataSourceActorContext, dataSourceId: string) {
    assertCanDeleteDataSources(actor.role);

    await this.getById(actor, dataSourceId);

    await dataSourceRepository.remove(dataSourceId, actor.workspaceId);
  },

  async sync(actor: DataSourceActorContext, dataSourceId: string) {
    assertCanManageDataSources(actor.role);

    return dataSourceSyncService.sync(actor, dataSourceId);
  },
};
