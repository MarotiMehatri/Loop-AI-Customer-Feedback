import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError.js";

export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (!req.user?.role || req.user.role !== "ADMIN") {
    next(new ApiError(403, "Access denied. Admin role required."));
    return;
  }
  next();
};
