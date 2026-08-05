import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.middleware.js";

import { authorize } from "../../middleware/authorize.middleware.js";

import { asyncHandler } from "../../utils/asyncHandler.js";

import { validate } from "../../middleware/validate.middleware.js";

import {
  createController,
  deleteController,
  exportController,
  generateController,
  getByIdController,
  listController,
  previewController,
  recentController,
  scheduleController,
  summaryController,
  updateController,
} from "./report.controller.js";

import {
  createReportSchema,
  exportReportSchema,
  listReportsSchema,
  previewReportSchema,
  reportIdSchema,
  scheduleReportSchema,
  updateReportSchema,
} from "./report.validator.js";

const router = Router();

router.use(authenticate);

router.get(
  "/summary",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  asyncHandler(summaryController),
);

router.get(
  "/recent",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  asyncHandler(recentController),
);

router.post(
  "/preview",
  authorize("ADMIN", "ANALYST"),
  validate(previewReportSchema),
  asyncHandler(previewController),
);

router.get(
  "/",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(listReportsSchema),
  asyncHandler(listController),
);

router.post(
  "/",
  authorize("ADMIN", "ANALYST"),
  validate(createReportSchema),
  asyncHandler(createController),
);

router.get(
  "/:reportId",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(reportIdSchema),
  asyncHandler(getByIdController),
);

router.patch(
  "/:reportId",
  authorize("ADMIN", "ANALYST"),
  validate(updateReportSchema),
  asyncHandler(updateController),
);

router.delete(
  "/:reportId",
  authorize("ADMIN"),
  validate(reportIdSchema),
  asyncHandler(deleteController),
);

router.post(
  "/:reportId/generate",
  authorize("ADMIN", "ANALYST"),
  validate(reportIdSchema),
  asyncHandler(generateController),
);

router.get(
  "/:reportId/export",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(exportReportSchema),
  asyncHandler(exportController),
);

router.post(
  "/:reportId/schedule",
  authorize("ADMIN"),
  validate(scheduleReportSchema),
  asyncHandler(scheduleController),
);

export default router;
