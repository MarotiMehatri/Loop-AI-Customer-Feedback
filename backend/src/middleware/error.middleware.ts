import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";

import { Prisma } from "../generated/prisma/client.js";
import { ZodError } from "zod";

import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

export const errorMiddleware: ErrorRequestHandler = (
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void => {
  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      message: "Request validation failed",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });

    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = error.meta?.["target"];
      response.status(409).json({
        success: false,
        message: "A record with this unique value already exists",
        fields: error.meta?.target,
      });

      return;
    }

    if (error.code === "P2025") {
      response.status(404).json({
        success: false,
        message: "Requested record was not found",
      });

      return;
    }
  }

  if (error instanceof ApiError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details,
    });

    return;
  }

  console.error("❌ Unhandled application error:", error);

  response.status(500).json({
    success: false,
    message: "Internal server error",

    ...(env.NODE_ENV === "development" && error instanceof Error
      ? {
          error: error.message,
          stack: error.stack,
        }
      : {}),
  });
};
