export { default as profileRouter } from "./profile.routes.js";

export {
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

export { profileService } from "./profile.service.js";
export { profileRepository } from "./profile.repository.js";
export { profileAvatarUpload, buildAvatarUrl, deleteAvatarFile } from "./profile-avatar.service.js";

export {
  mapProfile,
  mapPreference,
} from "./profile.mapper.js";

export {
  updateProfileSchema,
  changePasswordSchema,
  updatePreferencesSchema,
  profileActivitySchema,
} from "./profile.validator.js";

export type {
  UpdateProfileInput,
  UpdateAvatarInput,
  ChangePasswordInput,
  UpdatePreferencesInput,
  ProfileResponse,
  ProfileStatistics,
  ProfileActivityQuery,
  ProfileActivityInput,
} from "./profile.types.js";

export {
  PROFILE_MAX_NAME_LENGTH,
  PROFILE_MAX_PHONE_LENGTH,
  PROFILE_MAX_BIO_LENGTH,
  PROFILE_MAX_JOB_TITLE_LENGTH,
  PROFILE_MAX_DEPARTMENT_LENGTH,
  PROFILE_MAX_LOCATION_LENGTH,
  PROFILE_MAX_TIMEZONE_LENGTH,
  PROFILE_MIN_PASSWORD_LENGTH,
  PROFILE_MAX_PASSWORD_LENGTH,
  PROFILE_MAX_AVATAR_SIZE,
  PROFILE_ALLOWED_AVATAR_TYPES,
  PROFILE_DEFAULT_ACTIVITY_PAGE,
  PROFILE_DEFAULT_ACTIVITY_LIMIT,
  PROFILE_MAX_ACTIVITY_LIMIT,
  PROFILE_MESSAGES,
} from "./profile.constants.js";

export {
  assertCanReadProfile,
  assertCanUpdateProfile,
} from "./profile.permissions.js";
