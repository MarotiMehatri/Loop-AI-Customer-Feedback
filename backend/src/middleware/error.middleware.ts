import type { NextFunction, Request, Response } from "express";

import { Prisma } from "../generated/prisma/client.js";

import { ApiError } from "../utils/apiError.js";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error(error);

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details,
    });

    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({
        success: false,
        message: "A record with this value already exists",
      });

      return;
    }

    if (error.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "Requested record was not found",
      });

      return;
    }
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
