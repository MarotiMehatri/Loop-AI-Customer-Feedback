import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  getTrendsComparisonController,
  getTrendsController,
} from "./trends.controller.js";

import {
  getTrendsComparisonSchema,
  getTrendsSchema,
} from "./trends.validator.js";

export const trendsRouter = Router();

trendsRouter.use(authenticate);

/*
 * All authenticated roles can read trends.
 */
trendsRouter.get(
  "/",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(getTrendsSchema),
  asyncHandler(getTrendsController),
);

trendsRouter.get(
  "/comparison",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(getTrendsComparisonSchema),
  asyncHandler(getTrendsComparisonController),
);
