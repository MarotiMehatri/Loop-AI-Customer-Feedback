import type { Request, Response } from "express";

import { checkDatabase, getUptime } from "./health.service.js";

import type {
  HealthCheckResponse,
  LivenessResponse,
  ReadinessResponse,
} from "./health.types.js";

/**
 * GET /api/v1/health
 */
export const healthCheckController = async (
  _request: Request,
  response: Response,
): Promise<void> => {
  const db = await checkDatabase();
  const uptime = getUptime();

  const data: HealthCheckResponse = {
    status: "ok",
    database: db,
    ...uptime,
  };

  response.status(200).json({
    success: true,
    message: "Service is healthy",
    data,
  });
};

/**
 * GET /api/v1/health/live
 */
export const livenessController = async (
  _request: Request,
  response: Response,
): Promise<void> => {
  const data: LivenessResponse = {
    status: "alive",
    timestamp: new Date().toISOString(),
  };

  response.status(200).json({
    success: true,
    message: "Service is alive",
    data,
  });
};

/**
 * GET /api/v1/health/ready
 */
export const readinessController = async (
  _request: Request,
  response: Response,
): Promise<void> => {
  const db = await checkDatabase();
  const isReady = db.status === "connected";

  const data: ReadinessResponse = {
    status: isReady ? "ready" : "not_ready",
    database: db,
    timestamp: new Date().toISOString(),
  };

  response.status(isReady ? 200 : 503).json({
    success: isReady,
    message: isReady ? "Service is ready" : "Service is not ready",
    data,
  });
};
