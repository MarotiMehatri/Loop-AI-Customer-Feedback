import type { NextFunction, Request, Response } from "express";

import { ApiError } from "../utils/apiError.js";

const ALLOWED_ROLES = ["ADMIN", "ANALYST"] as const;

const checkAnalystRole = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (!req.user?.role || !(ALLOWED_ROLES as readonly string[]).includes(req.user.role)) {
    next(new ApiError(403, "Access denied. Analyst or admin role required."));
    return;
  }

  next();
};

export { checkAnalystRole as requireAnalystRole };
export { checkAnalystRole as analystRole };
