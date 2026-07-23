import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env.js";
import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/apiError.js";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    const decoded = await verifyToken(token);

    req.userId = decoded.userId;
    req.workspaceId = decoded.workspaceId;
    req.role = decoded.role;

    next();
  } catch (err) {
    if (err instanceof ApiError) {
      next(err);
    } else {
      next(new ApiError(401, "Invalid or expired token"));
    }
  }
};
