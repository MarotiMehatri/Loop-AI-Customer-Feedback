import type { NextFunction, Response } from "express";

import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import type { AuthenticatedRequest } from "../modules/auth/auth.types.js";
import type { JwtPayload } from "../modules/auth/auth.types.js";
import { ApiError } from "../utils/apiError.js";

export const authenticate = (
  request: AuthenticatedRequest,
  _response: Response,
  next: NextFunction,
): void => {
  try {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      throw new ApiError(401, "Authorization header is required");
    }

    const [scheme, token] = authorizationHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new ApiError(401, "Use the authorization format: Bearer <token>");
    }

    const decodedToken = jwt.verify(token, env.JWT_SECRET, {
      issuer: "loop-backend",
      audience: "loop-frontend",
    });

    if (
      typeof decodedToken === "string" ||
      !decodedToken.userId ||
      !decodedToken.email ||
      !decodedToken.role ||
      !decodedToken.workspaceId
    ) {
      throw new ApiError(401, "Invalid authentication token");
    }

    request.user = {
      userId: String(decodedToken.userId),
      email: String(decodedToken.email),
      role: decodedToken.role as JwtPayload["role"],
      workspaceId: String(decodedToken.workspaceId),
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      next(new ApiError(401, "Your authentication token has expired"));

      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, "Invalid authentication token"));

      return;
    }

    next(error);
  }
};
