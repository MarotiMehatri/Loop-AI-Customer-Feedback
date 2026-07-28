import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import { classificationController } from "./classification.controller.js";

import {
  classifyBatchSchema,
  classifyFeedbackByIdSchema,
  classifySingleSchema,
  listClassificationsSchema,
} from "./classification.validator.js";

export const classificationRouter = Router();

classificationRouter.use(authenticate);

classificationRouter.post(
  "/classify",
  authorize("ADMIN", "ANALYST"),
  validate(classifySingleSchema),
  asyncHandler(classificationController.classify),
);

classificationRouter.post(
  "/classify-batch",
  authorize("ADMIN", "ANALYST"),
  validate(classifyBatchSchema),
  asyncHandler(classificationController.classifyBatch),
);

classificationRouter.post(
  "/classify/:feedbackId",
  authorize("ADMIN", "ANALYST"),
  validate(classifyFeedbackByIdSchema),
  asyncHandler(classificationController.classifyFeedbackById),
);

classificationRouter.get(
  "/",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(listClassificationsSchema),
  asyncHandler(classificationController.list),
);
