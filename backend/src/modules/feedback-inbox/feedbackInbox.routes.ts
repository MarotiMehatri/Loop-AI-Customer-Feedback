import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  deleteFeedbackInboxController,
  feedbackInboxSummaryController,
  getFeedbackInboxController,
  listFeedbackInboxController,
  updateFeedbackInboxController,
  updateFeedbackStatusController,
} from "./feedbackInbox.controller.js";

import {
  feedbackInboxIdSchema,
  feedbackInboxListSchema,
  updateFeedbackInboxSchema,
  updateFeedbackStatusSchema,
} from "./feedbackInbox.validator.js";

export const feedbackInboxRouter = Router();

feedbackInboxRouter.use(authenticate);

/**
 * GET /api/v1/feedback-inbox/summary
 */
feedbackInboxRouter.get(
  "/summary",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  asyncHandler(feedbackInboxSummaryController),
);

/**
 * GET /api/v1/feedback-inbox
 */
feedbackInboxRouter.get(
  "/",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(feedbackInboxListSchema),
  asyncHandler(listFeedbackInboxController),
);

/**
 * GET /api/v1/feedback-inbox/:feedbackId
 */
feedbackInboxRouter.get(
  "/:feedbackId",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(feedbackInboxIdSchema),
  asyncHandler(getFeedbackInboxController),
);

/**
 * PATCH /api/v1/feedback-inbox/:feedbackId
 */
feedbackInboxRouter.patch(
  "/:feedbackId",
  authorize("ADMIN", "ANALYST"),
  validate(updateFeedbackInboxSchema),
  asyncHandler(updateFeedbackInboxController),
);

/**
 * PATCH /api/v1/feedback-inbox/:feedbackId/status
 */
feedbackInboxRouter.patch(
  "/:feedbackId/status",
  authorize("ADMIN", "ANALYST"),
  validate(updateFeedbackStatusSchema),
  asyncHandler(updateFeedbackStatusController),
);

/**
 * DELETE /api/v1/feedback-inbox/:feedbackId
 */
feedbackInboxRouter.delete(
  "/:feedbackId",
  authorize("ADMIN"),
  validate(feedbackInboxIdSchema),
  asyncHandler(deleteFeedbackInboxController),
);
