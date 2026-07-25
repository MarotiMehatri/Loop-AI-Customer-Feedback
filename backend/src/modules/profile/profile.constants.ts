export const PROFILE_MAX_NAME_LENGTH = 100;
export const PROFILE_MAX_PHONE_LENGTH = 30;
export const PROFILE_MAX_BIO_LENGTH = 500;
export const PROFILE_MAX_JOB_TITLE_LENGTH = 100;
export const PROFILE_MAX_DEPARTMENT_LENGTH = 100;
export const PROFILE_MAX_LOCATION_LENGTH = 150;
export const PROFILE_MAX_TIMEZONE_LENGTH = 100;

export const PROFILE_MIN_PASSWORD_LENGTH = 8;
export const PROFILE_MAX_PASSWORD_LENGTH = 128;

export const PROFILE_MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export const PROFILE_ALLOWED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const PROFILE_DEFAULT_ACTIVITY_PAGE = 1;
export const PROFILE_DEFAULT_ACTIVITY_LIMIT = 10;
export const PROFILE_MAX_ACTIVITY_LIMIT = 100;

export const PROFILE_MESSAGES = {
  retrieved: "Profile retrieved successfully",
  updated: "Profile updated successfully",
  avatarUpdated: "Profile avatar updated successfully",
  avatarRemoved: "Profile avatar removed successfully",
  passwordUpdated: "Password updated successfully",
  preferencesRetrieved: "Profile preferences retrieved successfully",
  preferencesUpdated: "Profile preferences updated successfully",
  statisticsRetrieved: "Profile statistics retrieved successfully",
  activityRetrieved: "Profile activity retrieved successfully",

  notFound: "Profile not found",
  invalidCurrentPassword: "Current password is incorrect",
  samePassword: "New password must be different from the current password",
  avatarRequired: "Avatar file is required",
  invalidAvatarType: "Only JPEG, PNG and WebP images are allowed",
  avatarTooLarge: "Avatar image must not exceed 5 MB",
  authenticationRequired: "Authentication is required",
  workspaceRequired: "Workspace is required",
} as const;
