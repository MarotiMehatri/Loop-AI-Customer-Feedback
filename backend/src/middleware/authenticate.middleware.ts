import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

export const authenticate = (
  request: Request,
  _response: Response,
  next: NextFunction,
): void => {
  try {
    // Get Authorization header
    const authorization = request.headers.authorization;

    // Authorization header is missing
    if (!authorization) {
      throw new ApiError(401, "Authorization header is required");
    }

    // Expected format:
    // Authorization: Bearer <token>
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new ApiError(
        401,
        "Use Authorization: Bearer <token>",
      );
    }

    // Verify JWT token
    const payload = jwt.verify(token, env.JWT_SECRET, {
      issuer: "loop-backend",
      audience: "loop-frontend",
    });

    // Validate JWT payload
    if (
      typeof payload === "string" ||
      !payload.userId ||
      !payload.email ||
      !payload.role ||
      !payload.workspaceId
    ) {
      throw new ApiError(401, "Invalid authentication token");
    }

    // Store authenticated user in request
    
request.user = {
  
  userId: String(payload.userId),
  email: String(payload.email),
  role: payload.role as NonNullable<Request["user"]>["role"],
  workspaceId: String(payload.workspaceId),
};

    // Continue to controller
    next();
  } catch (error) {
    // Our custom API error
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    // Expired JWT
    if (error instanceof jwt.TokenExpiredError) {
      next(
        new ApiError(
          401,
          "Authentication token has expired",
        ),
      );
      return;
    }

    // Invalid JWT
    if (error instanceof jwt.JsonWebTokenError) {
      next(
        new ApiError(
          401,
          "Invalid authentication token",
        ),
      );
      return;
    }

    // Unknown error
    next(error);
  }
};