import type { RequestHandler } from "express";
import { ApiError } from "../utils/apiError.js";

export const workspaceMiddleware: RequestHandler = (req, _res, next) => {
  try {
    const workspaceId = req.user?.workspaceId ?? req.headers["x-workspace-id"];

    const normalizedWorkspaceId = Array.isArray(workspaceId)
      ? workspaceId[0]
      : workspaceId;

    if (!normalizedWorkspaceId) {
      throw new ApiError(400, "Workspace context is missing");
    }

    req.workspaceId = normalizedWorkspaceId;

    next();
  } catch (error) {
    next(error);
  }
};
