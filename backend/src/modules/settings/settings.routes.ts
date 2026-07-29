import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.middleware.js";

import { authorize } from "../../middleware/authorize.middleware.js";

import { validate } from "../../middleware/validate.middleware.js";

import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  getAllSettingsController,
  getSettingsSectionController,
  resetSettingsSectionController,
  updateSettingsSectionController,
} from "./settings.controller.js";

import {
  resetSettingsSectionSchema,
  settingsSectionSchema,
  updateSettingsSchema,
} from "./settings.validator.js";

const settingsRouter = Router();

settingsRouter.use(authenticate);

settingsRouter.get(
  "/",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  asyncHandler(getAllSettingsController),
);

settingsRouter.get(
  "/:section",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(settingsSectionSchema),
  asyncHandler(getSettingsSectionController),
);

settingsRouter.patch(
  "/:section",
  authorize("ADMIN"),
  validate(updateSettingsSchema),
  asyncHandler(updateSettingsSectionController),
);

settingsRouter.post(
  "/:section/reset",
  authorize("ADMIN"),
  validate(resetSettingsSectionSchema),
  asyncHandler(resetSettingsSectionController),
);

export default settingsRouter;
