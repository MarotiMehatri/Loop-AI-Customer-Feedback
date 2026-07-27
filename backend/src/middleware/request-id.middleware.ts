import type { NextFunction, Request, Response } from "express";

import { randomUUID } from "node:crypto";

export const requestId = (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  const id = (request.headers["x-request-id"] as string) || randomUUID();

  request.headers["x-request-id"] = id;
  response.setHeader("X-Request-Id", id);

  next();
};
