import { Router } from "express";

import { validate } from "../../middleware/validate.middleware.js";

import { profileAvatarUpload } from "./profile.avatar.js";

import { profileController } from "./profile.controller.js";

import {
  changePasswordSchema,
  profileActivitySchema,
  updatePreferencesSchema,
  updateProfileSchema,
} from "./profile.validator.js";

const profileRouter = Router();

profileRouter.get("/", profileController.getProfile);

profileRouter.patch(
  "/",
  validate(updateProfileSchema),
  profileController.updateProfile,
);

profileRouter.patch(
  "/avatar",
  profileAvatarUpload.single("avatar"),
  profileController.updateAvatar,
);

profileRouter.delete("/avatar", profileController.removeAvatar);

profileRouter.get("/preferences", profileController.getPreferences);

profileRouter.patch(
  "/preferences",
  validate(updatePreferencesSchema),
  profileController.updatePreferences,
);

profileRouter.patch(
  "/password",
  validate(changePasswordSchema),
  profileController.changePassword,
);

profileRouter.get("/statistics", profileController.getStatistics);

profileRouter.get(
  "/activity",
  validate(profileActivitySchema),
  profileController.getActivity,
);

export default profileRouter;
