import type { Request, RequestHandler } from "express";
import { ApiError } from "../../utils/apiError.js";
import { WORKSPACE_MESSAGES } from "./workspace.constants.js";
import { workspaceService } from "./workspace.service.js";
import type {
  DeleteWorkspaceInput,
  UpdateWorkspaceInput,
  WorkspaceContext,
} from "./workspace.types.js";

function getWorkspaceContext(request: Request): WorkspaceContext {
  const userId = request.user?.userId;
  const workspaceId = request.workspaceId ?? request.user?.workspaceId;
  const role = request.user?.role;

  if (!userId || !role) {
    throw new ApiError(401, WORKSPACE_MESSAGES.authenticationRequired);
  }

  if (!workspaceId) {
    throw new ApiError(400, WORKSPACE_MESSAGES.workspaceRequired);
  }

  return { userId, workspaceId, role };
}

export const workspaceController: {
  get: RequestHandler;
  summary: RequestHandler;
  update: RequestHandler;
  remove: RequestHandler;
} = {
  get: async (request, response, next) => {
    try {
      const result = await workspaceService.get(getWorkspaceContext(request));
      response.status(200).json({
        success: true,
        message: WORKSPACE_MESSAGES.retrieved,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  summary: async (request, response, next) => {
    try {
      const result = await workspaceService.getSummary(
        getWorkspaceContext(request),
      );
      response.status(200).json({
        success: true,
        message: WORKSPACE_MESSAGES.summaryRetrieved,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  update: async (request, response, next) => {
    try {
      const result = await workspaceService.update(
        getWorkspaceContext(request),
        request.body as UpdateWorkspaceInput,
      );
      response.status(200).json({
        success: true,
        message: WORKSPACE_MESSAGES.updated,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  remove: async (request, response, next) => {
    try {
      await workspaceService.remove(
        getWorkspaceContext(request),
        request.body as DeleteWorkspaceInput,
      );
      response.status(200).json({
        success: true,
        message: WORKSPACE_MESSAGES.deleted,
      });
    } catch (error) {
      next(error);
    }
  },
};
