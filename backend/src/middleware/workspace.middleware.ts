import type { NextFunction, Request, Response } from "express";

import { ApiError } from "../utils/apiError.js";

export function workspaceMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    const workspaceId = req.headers["x-workspace-id"] ?? req.user?.workspaceId;

    if (!workspaceId || typeof workspaceId !== "string") {
      throw new ApiError(400, "Workspace is required");
    }

    req.workspaceId = workspaceId;

    next();
  } catch (error) {
    next(error);
  }
}
