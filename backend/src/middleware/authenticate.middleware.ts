import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import type { Role } from "../generated/prisma/client.js";
import { ApiError } from "../utils/apiError.js";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
  workspaceId: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

export const authenticate = (
  request: Request,
  _response: Response,
  next: NextFunction,
): void => {
  try {
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new ApiError(401, "Authorization header is required");
    }

    const parts = authorization.trim().split(/\s+/);

    if (
      parts.length !== 2 ||
      parts[0]?.toLowerCase() !== "bearer" ||
      !parts[1]
    ) {
      throw new ApiError(401, "Use Authorization: Bearer <token>");
    }

    const token = parts[1];
    const payload = jwt.verify(token, env.JWT_SECRET, {
      issuer: "loop-backend",
      audience: "loop-frontend",
    });

    if (
      typeof payload === "string" ||
      !payload.userId ||
      !payload.email ||
      !payload.role ||
      !payload.workspaceId
    ) {
      throw new ApiError(401, "Invalid authentication token");
    }

    request.user = {
      userId: String(payload.userId),
      email: String(payload.email),
      role: payload.role as Role,
      workspaceId: String(payload.workspaceId),
    };

    next();
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      next(new ApiError(401, "Authentication token has expired"));
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, "Invalid authentication token"));
      return;
    }

    next(error);
  }
};

export default authenticate;
