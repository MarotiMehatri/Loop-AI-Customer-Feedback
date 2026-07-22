import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  createFeedbackController,
  deleteFeedbackController,
  getFeedbackController,
  listFeedbackController,
  updateFeedbackController,
  updateFeedbackStatusController,
} from "./feedback.controller.js";

import {
  createFeedbackSchema,
  feedbackIdSchema,
  listFeedbackSchema,
  updateFeedbackSchema,
  updateFeedbackStatusSchema,
} from "./feedback.validator.js";

export const feedbackRouter = Router();

feedbackRouter.use(authenticate);

/*
 * All authenticated roles can read feedback.
 */
feedbackRouter.get(
  "/",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(listFeedbackSchema),
  asyncHandler(listFeedbackController),
);

feedbackRouter.get(
  "/:feedbackId",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(feedbackIdSchema),
  asyncHandler(getFeedbackController),
);

/*
 * Admin and Analyst can create feedback.
 */
feedbackRouter.post(
  "/",
  authorize("ADMIN", "ANALYST"),
  validate(createFeedbackSchema),
  asyncHandler(createFeedbackController),
);

/*
 * Admin and Analyst can update feedback.
 */
feedbackRouter.patch(
  "/:feedbackId",
  authorize("ADMIN", "ANALYST"),
  validate(updateFeedbackSchema),
  asyncHandler(updateFeedbackController),
);

feedbackRouter.patch(
  "/:feedbackId/status",
  authorize("ADMIN", "ANALYST"),
  validate(updateFeedbackStatusSchema),
  asyncHandler(updateFeedbackStatusController),
);

/*
 * Only Admin can permanently delete feedback.
 */
feedbackRouter.delete(
  "/:feedbackId",
  authorize("ADMIN"),
  validate(feedbackIdSchema),
  asyncHandler(deleteFeedbackController),
);
