import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import { trendsController } from "./trends.controller.js";

import {
  detectAnomaliesSchema,
  detectTrendSchema,
  generateForecastSchema,
  generateInsightsSchema,
  getTrendsComparisonSchema,
  getTrendsSchema,
} from "./trends.validator.js";

export const trendsRouter = Router();

trendsRouter.use(authenticate);

trendsRouter.get(
  "/",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(getTrendsSchema),
  asyncHandler(trendsController.getTrends),
);

trendsRouter.get(
  "/comparison",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(getTrendsComparisonSchema),
  asyncHandler(trendsController.getTrendsComparison),
);

trendsRouter.get(
  "/detect",
  authorize("ADMIN", "ANALYST"),
  validate(detectTrendSchema),
  asyncHandler(trendsController.detectTrend),
);

trendsRouter.get(
  "/anomalies",
  authorize("ADMIN", "ANALYST"),
  validate(detectAnomaliesSchema),
  asyncHandler(trendsController.detectAnomalies),
);

trendsRouter.get(
  "/forecast",
  authorize("ADMIN", "ANALYST"),
  validate(generateForecastSchema),
  asyncHandler(trendsController.generateForecast),
);

trendsRouter.get(
  "/insights",
  authorize("ADMIN"),
  validate(generateInsightsSchema),
  asyncHandler(trendsController.generateInsights),
);
