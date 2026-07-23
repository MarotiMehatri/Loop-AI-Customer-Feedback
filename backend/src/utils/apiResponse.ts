import type { Response } from "express";

export const success = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200,
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const error = (
  res: Response,
  message: string,
  statusCode = 500,
  details?: unknown,
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    details,
  });
};
