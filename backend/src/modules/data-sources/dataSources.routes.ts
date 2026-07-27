import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  createDataSourceController,
  deleteDataSourceController,
  getDataSourceController,
  listDataSourceController,
  syncDataSourceController,
  updateDataSourceController,
} from "./dataSources.controller.js";

import {
  createDataSourceSchema,
  dataSourceIdSchema,
  listDataSourceSchema,
  updateDataSourceSchema,
} from "./dataSources.validator.js";

export const dataSourcesRouter = Router();

dataSourcesRouter.use(authenticate);

/*
 * All authenticated roles can read data sources.
 */
dataSourcesRouter.get(
  "/",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(listDataSourceSchema),
  asyncHandler(listDataSourceController),
);

dataSourcesRouter.get(
  "/:dataSourceId",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(dataSourceIdSchema),
  asyncHandler(getDataSourceController),
);

/*
 * Admin and Analyst can create data sources.
 */
dataSourcesRouter.post(
  "/",
  authorize("ADMIN", "ANALYST"),
  validate(createDataSourceSchema),
  asyncHandler(createDataSourceController),
);

/*
 * Admin and Analyst can update data sources.
 */
dataSourcesRouter.patch(
  "/:dataSourceId",
  authorize("ADMIN", "ANALYST"),
  validate(updateDataSourceSchema),
  asyncHandler(updateDataSourceController),
);

/*
 * Admin and Analyst can trigger sync.
 */
dataSourcesRouter.post(
  "/:dataSourceId/sync",
  authorize("ADMIN", "ANALYST"),
  validate(dataSourceIdSchema),
  asyncHandler(syncDataSourceController),
);

/*
 * Only Admin can delete data sources.
 */
dataSourcesRouter.delete(
  "/:dataSourceId",
  authorize("ADMIN"),
  validate(dataSourceIdSchema),
  asyncHandler(deleteDataSourceController),
);
