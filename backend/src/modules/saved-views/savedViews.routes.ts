import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  createSavedViewController,
  deleteSavedViewController,
  getSavedViewController,
  listSavedViewController,
  updateSavedViewController,
} from "./savedViews.controller.js";

import {
  createSavedViewSchema,
  listSavedViewSchema,
  savedViewIdSchema,
  updateSavedViewSchema,
} from "./savedViews.validator.js";

export const savedViewsRouter = Router();

savedViewsRouter.use(authenticate);

/*
 * All authenticated roles can read saved views.
 */
savedViewsRouter.get(
  "/",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(listSavedViewSchema),
  asyncHandler(listSavedViewController),
);

savedViewsRouter.get(
  "/:viewId",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(savedViewIdSchema),
  asyncHandler(getSavedViewController),
);

/*
 * Admin and Analyst can create saved views.
 */
savedViewsRouter.post(
  "/",
  authorize("ADMIN", "ANALYST"),
  validate(createSavedViewSchema),
  asyncHandler(createSavedViewController),
);

/*
 * Admin and Analyst can update saved views.
 */
savedViewsRouter.patch(
  "/:viewId",
  authorize("ADMIN", "ANALYST"),
  validate(updateSavedViewSchema),
  asyncHandler(updateSavedViewController),
);

/*
 * Only Admin can delete saved views.
 */
savedViewsRouter.delete(
  "/:viewId",
  authorize("ADMIN"),
  validate(savedViewIdSchema),
  asyncHandler(deleteSavedViewController),
);
