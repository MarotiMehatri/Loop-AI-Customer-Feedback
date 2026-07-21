import type { NextFunction, Request, Response } from "express";

import { ApiError } from "../utils/apiError.js";

export const notFound = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
};
