import type { Request, RequestHandler } from "express";

import { ApiError } from "../../utils/apiError.js";

import { DATA_SOURCE_MESSAGES } from "./data-source.constants.js";

import { dataSourceService } from "./data-source.service.js";

import type {
  CreateDataSourceInput,
  DataSourceActorContext,
  DataSourceListFilters,
  UpdateDataSourceInput,
} from "./data-source.types.js";

function getActorContext(request: Request): DataSourceActorContext {
  const userId = request.user?.userId;
  const workspaceId = request.workspaceId ?? request.user?.workspaceId;
  const role = request.user?.role;

  if (!userId || !role) {
    throw new ApiError(401, DATA_SOURCE_MESSAGES.authenticationRequired);
  }

  if (!workspaceId) {
    throw new ApiError(400, DATA_SOURCE_MESSAGES.workspaceRequired);
  }

  return { userId, workspaceId, role };
}

function getDataSourceId(request: Request): string {
  return request.params.dataSourceId as string;
}

export const dataSourceController: {
  create: RequestHandler;
  list: RequestHandler;
  getById: RequestHandler;
  update: RequestHandler;
  remove: RequestHandler;
  sync: RequestHandler;
} = {
  create: async (request, response, next) => {
    try {
      const context = getActorContext(request);

      const result = await dataSourceService.create(
        context,
        request.body as CreateDataSourceInput,
      );

      response.status(201).json({
        success: true,
        message: DATA_SOURCE_MESSAGES.created,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  list: async (request, response, next) => {
    try {
      const context = getActorContext(request);

      const result = await dataSourceService.list(
        context,
        request.query as unknown as DataSourceListFilters,
      );

      response.status(200).json({
        success: true,
        message: DATA_SOURCE_MESSAGES.listed,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  getById: async (request, response, next) => {
    try {
      const context = getActorContext(request);

      const result = await dataSourceService.getById(
        context,
        getDataSourceId(request),
      );

      response.status(200).json({
        success: true,
        message: DATA_SOURCE_MESSAGES.retrieved,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  update: async (request, response, next) => {
    try {
      const context = getActorContext(request);

      const result = await dataSourceService.update(
        context,
        getDataSourceId(request),
        request.body as UpdateDataSourceInput,
      );

      response.status(200).json({
        success: true,
        message: DATA_SOURCE_MESSAGES.updated,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  remove: async (request, response, next) => {
    try {
      const context = getActorContext(request);

      await dataSourceService.remove(context, getDataSourceId(request));

      response.status(200).json({
        success: true,
        message: DATA_SOURCE_MESSAGES.deleted,
      });
    } catch (error) {
      next(error);
    }
  },

  sync: async (request, response, next) => {
    try {
      const context = getActorContext(request);

      const result = await dataSourceService.sync(
        context,
        getDataSourceId(request),
      );

      response.status(200).json({
        success: true,
        message: DATA_SOURCE_MESSAGES.syncStarted,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
