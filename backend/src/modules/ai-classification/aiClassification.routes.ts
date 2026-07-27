import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  classifyFeedbackBatchController,
  classifyFeedbackController,
} from "./aiClassification.controller.js";

import {
  classifyBatchSchema,
  classifySingleSchema,
} from "./aiClassification.validator.js";

export const aiClassificationRouter = Router();

aiClassificationRouter.use(authenticate);

/*
 * Admin and Analyst can classify feedback.
 */
aiClassificationRouter.post(
  "/classify",
  authorize("ADMIN", "ANALYST"),
  validate(classifySingleSchema),
  asyncHandler(classifyFeedbackController),
);

aiClassificationRouter.post(
  "/classify-batch",
  authorize("ADMIN", "ANALYST"),
  validate(classifyBatchSchema),
  asyncHandler(classifyFeedbackBatchController),
);
