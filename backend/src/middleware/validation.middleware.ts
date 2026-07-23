import type { NextFunction, Request, Response } from "express";

import { z } from "zod";

import { ApiError } from "../utils/apiError.js";

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formatted = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      next(new ApiError(400, "Validation failed", formatted));
      return;
    }

    req.body = result.data;
    next();
  };
};
