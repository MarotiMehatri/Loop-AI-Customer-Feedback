import type { NextFunction, Request, Response } from "express";

import { logger } from "../config/logger.js";

export const requestLogger = (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  const start = Date.now();

  response.on("finish", () => {
    const duration = Date.now() - start;
    const requestId = request.headers["x-request-id"] as string | undefined;

    logger.info(
      `${request.method} ${request.originalUrl} ${response.statusCode} ${duration}ms${requestId ? ` [${requestId}]` : ""}`,
    );
  });

  next();
};
