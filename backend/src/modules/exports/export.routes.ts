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

/* -------------------------------------------------------------------------- */
/* Authentication                                                             */
/* -------------------------------------------------------------------------- */

exportsRouter.use(authenticate);

/* -------------------------------------------------------------------------- */
/* LIST EXPORTS                                                               */
/* GET /api/v1/exports                                                        */
/* -------------------------------------------------------------------------- */

exportsRouter.get(
  "/",
  authorize(
    "ADMIN",
    "ANALYST",
    "VIEWER",
  ),
  validate(listExportSchema),
  asyncHandler(
    exportController.list,
  ),
);

/* -------------------------------------------------------------------------- */
/* CREATE EXPORT                                                              */
/* POST /api/v1/exports                                                       */
/* -------------------------------------------------------------------------- */

exportsRouter.post(
  "/",
  authorize(
    "ADMIN",
    "ANALYST",
  ),
  validate(createExportSchema),
  asyncHandler(
    exportController.create,
  ),
);

/* -------------------------------------------------------------------------- */
/* DOWNLOAD EXPORT                                                            */
/* GET /api/v1/exports/:exportId/download                                     */
/* -------------------------------------------------------------------------- */

exportsRouter.get(
  "/:exportId/download",
  authorize(
    "ADMIN",
    "ANALYST",
    "VIEWER",
  ),
  validate(exportIdSchema),
  asyncHandler(
    exportController.download,
  ),
);

/* -------------------------------------------------------------------------- */
/* DELETE EXPORT                                                              */
/* DELETE /api/v1/exports/:exportId                                           */
/* -------------------------------------------------------------------------- */

exportsRouter.delete(
  "/:exportId",
  authorize(
    "ADMIN",
    "ANALYST",
  ),
  validate(exportIdSchema),
  asyncHandler(
    exportController.remove,
  ),
);

/* -------------------------------------------------------------------------- */
/* GET EXPORT BY ID                                                           */
/* GET /api/v1/exports/:exportId                                              */
/* -------------------------------------------------------------------------- */

exportsRouter.get(
  "/:exportId",
  authorize(
    "ADMIN",
    "ANALYST",
    "VIEWER",
  ),
  validate(exportIdSchema),
  asyncHandler(
    exportController.getById,
  ),
);

export default exportsRouter;