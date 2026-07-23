import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { uploadFeedbackCsv } from "../../middleware/upload.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  deleteFeedbackImportController,
  getFeedbackImportController,
  importFeedbackCsvController,
  listFeedbackImportsController,
} from "./feedbackImport.controller.js";

import {
  feedbackImportIdParamsSchema,
  feedbackImportListQuerySchema,
} from "./feedbackImport.validator.js";

export const feedbackImportRouter = Router();

feedbackImportRouter.use(authenticate);

feedbackImportRouter.post(
  "/csv",
  authorize("ADMIN", "ANALYST"),
  uploadFeedbackCsv.single("file"),
  asyncHandler(importFeedbackCsvController),
);

feedbackImportRouter.get(
  "/history",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(feedbackImportListQuerySchema),
  asyncHandler(listFeedbackImportsController),
);

feedbackImportRouter.get(
  "/:importId",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(feedbackImportIdParamsSchema),
  asyncHandler(getFeedbackImportController),
);

feedbackImportRouter.delete(
  "/:importId",
  authorize("ADMIN"),
  validate(feedbackImportIdParamsSchema),
  asyncHandler(deleteFeedbackImportController),
);
