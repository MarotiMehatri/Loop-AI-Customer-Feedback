import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.middleware.js";

import { authorize } from "../../middleware/authorize.middleware.js";

import { asyncHandler } from "../../utils/asyncHandler.js";

import { validate } from "../../middleware/validate.middleware.js";

import {
  analyticsController,
  assignFeedbackController,
  createController,
  generateController,
  getByIdController,
  listController,
  listFeedbackController,
  removeController,
  removeFeedbackController,
  summaryController,
  updateController,
} from "./theme.controller.js";

import {
  assignFeedbackSchema,
  createThemeSchema,
  generateThemesSchema,
  listThemeFeedbackSchema,
  listThemesSchema,
  removeFeedbackSchema,
  themeIdSchema,
  updateThemeSchema,
} from "./theme.validator.js";

const router = Router();

router.use(authenticate);

router.get(
  "/summary",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  asyncHandler(summaryController),
);

router.post(
  "/generate",
  authorize("ADMIN", "ANALYST"),
  validate(generateThemesSchema),
  asyncHandler(generateController),
);

router.get(
  "/",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(listThemesSchema),
  asyncHandler(listController),
);

router.post(
  "/",
  authorize("ADMIN", "ANALYST"),
  validate(createThemeSchema),
  asyncHandler(createController),
);

router.get(
  "/:themeId/analytics",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(themeIdSchema),
  asyncHandler(analyticsController),
);

router.get(
  "/:themeId/feedback",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(listThemeFeedbackSchema),
  asyncHandler(listFeedbackController),
);

router.post(
  "/:themeId/feedback/:feedbackId",
  authorize("ADMIN", "ANALYST"),
  validate(assignFeedbackSchema),
  asyncHandler(assignFeedbackController),
);

router.delete(
  "/:themeId/feedback/:feedbackId",
  authorize("ADMIN", "ANALYST"),
  validate(removeFeedbackSchema),
  asyncHandler(removeFeedbackController),
);

router.get(
  "/:themeId",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(themeIdSchema),
  asyncHandler(getByIdController),
);

router.patch(
  "/:themeId",
  authorize("ADMIN", "ANALYST"),
  validate(updateThemeSchema),
  asyncHandler(updateController),
);

router.delete(
  "/:themeId",
  authorize("ADMIN"),
  validate(themeIdSchema),
  asyncHandler(removeController),
);

export default router;
