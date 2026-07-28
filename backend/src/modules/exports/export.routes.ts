import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import { exportController } from "./export.controller.js";

import {
  createExportSchema,
  exportIdSchema,
  listExportSchema,
} from "./export.validator.js";

const exportsRouter = Router();

exportsRouter.use(authenticate);

exportsRouter.get(
  "/",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(listExportSchema),
  asyncHandler(exportController.list),
);

exportsRouter.get(
  "/:exportId",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(exportIdSchema),
  asyncHandler(exportController.getById),
);

exportsRouter.post(
  "/",
  authorize("ADMIN", "ANALYST"),
  validate(createExportSchema),
  asyncHandler(exportController.create),
);

exportsRouter.get(
  "/:exportId/download",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(exportIdSchema),
  asyncHandler(exportController.download),
);

export default exportsRouter;
