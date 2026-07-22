import type { NextFunction, Request, Response } from "express";

import type { ZodType } from "zod";

export const validate = (schema: ZodType) => {
  return (request: Request, response: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: request.body,
      query: request.query,
      params: request.params,
    });

    if (!result.success) {
      response.status(400).json({
        success: false,
        message: "Request validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });

      return;
    }

    const validatedData = result.data as {
      body?: unknown;
      query?: unknown;
      params?: unknown;
    };

    if (validatedData.body !== undefined) {
      request.body = validatedData.body;
    }

    if (validatedData.query !== undefined) {
      Object.defineProperty(request, "query", {
        value: validatedData.query,
        writable: true,
      });
    }

    if (validatedData.params !== undefined) {
      request.params = validatedData.params as typeof request.params;
    }

    next();
  };
};
