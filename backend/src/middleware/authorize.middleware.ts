import type { NextFunction, Request, Response } from "express";

import type { Role } from "../generated/prisma/client.js";
import { ApiError } from "../utils/apiError.js";

export const authorize = (...allowedRoles: Role[]) => {
  return (request: Request, _response: Response, next: NextFunction): void => {
    if (!request.user) {
      next(new ApiError(401, "Authentication is required"));

      return;
    }

    if (!allowedRoles.includes(request.user.role)) {
      next(
        new ApiError(403, "You do not have permission to perform this action"),
      );

      return;
    }

    next();
  };
};
