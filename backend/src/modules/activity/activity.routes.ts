import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.middleware.js";

import { authorize } from "../../middleware/authorize.middleware.js";

import { asyncHandler } from "../../utils/asyncHandler.js";

import { validate } from "../../middleware/validate.middleware.js";

import {
  clearController,
  getByIdController,
  listController,
  listMineController,
  recentController,
  removeController,
  summaryController,
} from "./activity.controller.js";

import {
  activityIdSchema,
  activitySummarySchema,
  clearActivitySchema,
  listActivitySchema,
  recentActivitySchema,
} from "./activity.validator.js";

const router = Router();

router.use(authenticate);

router.get(
  "/summary",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(activitySummarySchema),
  asyncHandler(summaryController),
);

router.get(
  "/recent",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(recentActivitySchema),
  asyncHandler(recentController),
);

router.get(
  "/me",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(listActivitySchema),
  asyncHandler(listMineController),
);

router.get(
  "/",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(listActivitySchema),
  asyncHandler(listController),
);

router.delete(
  "/",
  authorize("ADMIN"),
  validate(clearActivitySchema),
  asyncHandler(clearController),
);

router.get(
  "/:activityId",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(activityIdSchema),
  asyncHandler(getByIdController),
);

router.delete(
  "/:activityId",
  authorize("ADMIN"),
  validate(activityIdSchema),
  asyncHandler(removeController),
);

export { router as activityRoutes };
