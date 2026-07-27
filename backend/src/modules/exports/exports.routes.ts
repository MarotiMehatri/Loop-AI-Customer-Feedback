import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  createExportController,
  downloadExportController,
  getExportController,
  listExportController,
} from "./exports.controller.js";

import {
  createExportSchema,
  exportIdSchema,
  listExportSchema,
} from "./exports.validator.js";

export const exportsRouter = Router();

exportsRouter.use(authenticate);

/*
 * All authenticated roles can read exports.
 */
exportsRouter.get(
  "/",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(listExportSchema),
  asyncHandler(listExportController),
);

exportsRouter.get(
  "/:exportId",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(exportIdSchema),
  asyncHandler(getExportController),
);

/*
 * Admin and Analyst can create exports.
 */
exportsRouter.post(
  "/",
  authorize("ADMIN", "ANALYST"),
  validate(createExportSchema),
  asyncHandler(createExportController),
);

/*
 * All authenticated roles can download completed exports.
 */
exportsRouter.get(
  "/:exportId/download",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(exportIdSchema),
  asyncHandler(downloadExportController),
);
