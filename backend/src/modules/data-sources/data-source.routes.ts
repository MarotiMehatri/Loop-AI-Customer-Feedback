import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import { dataSourceController } from "./data-source.controller.js";

import {
  createDataSourceSchema,
  dataSourceIdSchema,
  listDataSourceSchema,
  updateDataSourceSchema,
} from "./data-source.validator.js";

const dataSourcesRouter = Router();

dataSourcesRouter.use(authenticate);

dataSourcesRouter.get(
  "/",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(listDataSourceSchema),
  asyncHandler(dataSourceController.list),
);

dataSourcesRouter.get(
  "/:dataSourceId",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(dataSourceIdSchema),
  asyncHandler(dataSourceController.getById),
);

dataSourcesRouter.post(
  "/",
  authorize("ADMIN", "ANALYST"),
  validate(createDataSourceSchema),
  asyncHandler(dataSourceController.create),
);

dataSourcesRouter.patch(
  "/:dataSourceId",
  authorize("ADMIN", "ANALYST"),
  validate(updateDataSourceSchema),
  asyncHandler(dataSourceController.update),
);

dataSourcesRouter.post(
  "/:dataSourceId/sync",
  authorize("ADMIN", "ANALYST"),
  validate(dataSourceIdSchema),
  asyncHandler(dataSourceController.sync),
);

dataSourcesRouter.delete(
  "/:dataSourceId",
  authorize("ADMIN"),
  validate(dataSourceIdSchema),
  asyncHandler(dataSourceController.remove),
);

export default dataSourcesRouter;
