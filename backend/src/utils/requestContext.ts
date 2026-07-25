import type { Request } from "express";

import { ApiError } from "./apiError.js";

export function getWorkspaceId(req: Request): string {
  const workspaceId = req.workspaceId ?? req.user?.workspaceId;

  if (!workspaceId) {
    throw new ApiError(400, "Workspace is required");
  }

  return workspaceId;
}

export function getUserId(req: Request): string {
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError(401, "Authentication required");
  }

  return userId;
}

export function getRequestContext(req: Request): {
  userId: string;
  workspaceId: string;
} {
  return {
    userId: getUserId(req),
    workspaceId: getWorkspaceId(req),
  };
}
