import { Router } from "express";

import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  healthCheckController,
  livenessController,
  readinessController,
} from "./health.controller.js";

export const healthRouter = Router();

/**
 * GET /api/v1/health
 */
healthRouter.get("/", asyncHandler(healthCheckController));

/**
 * GET /api/v1/health/live
 */
healthRouter.get("/live", asyncHandler(livenessController));

/**
 * GET /api/v1/health/ready
 */
healthRouter.get("/ready", asyncHandler(readinessController));
