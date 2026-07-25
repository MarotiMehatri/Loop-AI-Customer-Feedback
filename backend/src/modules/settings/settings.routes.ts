import { Router } from "express";

import { validate } from "../../middleware/validate.middleware.js";

import { settingsController } from "./settings.controller.js";

import {
  resetSettingsSectionSchema,
  settingsSectionSchema,
  updateSettingsSchema,
} from "./settings.validator.js";

const settingsRouter = Router();

settingsRouter.get("/", settingsController.getAll);

settingsRouter.get(
  "/:section",
  validate(settingsSectionSchema),
  settingsController.getSection,
);

settingsRouter.patch(
  "/:section",
  validate(updateSettingsSchema),
  settingsController.updateSection,
);

settingsRouter.post(
  "/:section/reset",
  validate(resetSettingsSectionSchema),
  settingsController.resetSection,
);

export default settingsRouter;
