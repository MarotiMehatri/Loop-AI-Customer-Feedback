import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.middleware.js";

import { validate } from "../../middleware/validate.middleware.js";

import { asyncHandler } from "../../utils/asyncHandler.js";

import { profileAvatarUpload } from "./profile-avatar.service.js";

import {
  changePasswordController,
  getActivityController,
  getPreferencesController,
  getProfileController,
  getStatisticsController,
  removeAvatarController,
  updateAvatarController,
  updatePreferencesController,
  updateProfileController,
} from "./profile.controller.js";

import {
  changePasswordSchema,
  profileActivitySchema,
  updatePreferencesSchema,
  updateProfileSchema,
} from "./profile.validator.js";

const profileRouter = Router();

profileRouter.use(authenticate);

profileRouter.get("/", asyncHandler(getProfileController));

profileRouter.patch(
  "/",
  validate(updateProfileSchema),
  asyncHandler(updateProfileController),
);

profileRouter.patch(
  "/avatar",
  profileAvatarUpload.single("avatar"),
  asyncHandler(updateAvatarController),
);

profileRouter.delete(
  "/avatar",
  asyncHandler(removeAvatarController),
);

profileRouter.get(
  "/preferences",
  asyncHandler(getPreferencesController),
);

profileRouter.patch(
  "/preferences",
  validate(updatePreferencesSchema),
  asyncHandler(updatePreferencesController),
);

profileRouter.patch(
  "/password",
  validate(changePasswordSchema),
  asyncHandler(changePasswordController),
);

profileRouter.get(
  "/statistics",
  asyncHandler(getStatisticsController),
);

profileRouter.get(
  "/activity",
  validate(profileActivitySchema),
  asyncHandler(getActivityController),
);

export default profileRouter;
