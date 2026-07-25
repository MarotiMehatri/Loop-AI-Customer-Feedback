import { ApiError } from "../../utils/apiError.js";

import { buildAvatarUrl, deleteAvatarFile } from "./profile.avatar.js";

import { PROFILE_ACTIVITY, recordProfileActivity } from "./profile.activity.js";

import { PROFILE_MESSAGES } from "./profile.constants.js";

import {
  normalizeOptionalText,
  normalizePhone,
  normalizeProfileName,
  normalizeTimezone,
} from "./profile.helper.js";

import { mapProfile } from "./profile.mapper.js";

import { profileRepository } from "./profile.repository.js";

import type { UpdateProfileInput } from "./profile.types.js";

export const profileService = {
  async getProfile(userId: string, workspaceId: string) {
    const profile = await profileRepository.findById(userId);

    if (!profile || profile.workspaceId !== workspaceId) {
      throw new ApiError(404, PROFILE_MESSAGES.notFound);
    }

    return mapProfile(profile);
  },

  async updateProfile(
    userId: string,
    workspaceId: string,
    input: UpdateProfileInput,
  ) {
    const updated = await profileRepository.updateProfile(userId, workspaceId, {
      name:
        input.name !== undefined ? normalizeProfileName(input.name) : undefined,

      phone: normalizePhone(input.phone),

      bio: normalizeOptionalText(input.bio),

      jobTitle: normalizeOptionalText(input.jobTitle),

      department: normalizeOptionalText(input.department),

      location: normalizeOptionalText(input.location),

      timezone: normalizeTimezone(input.timezone),
    });

    if (!updated) {
      throw new ApiError(404, PROFILE_MESSAGES.notFound);
    }

    await recordProfileActivity({
      userId,
      workspaceId,

      type: PROFILE_ACTIVITY.profileUpdated,

      title: "Profile updated",

      description: "Personal profile information was updated.",

      metadata: {
        updatedFields: Object.keys(input),
      },
    });

    return mapProfile(updated);
  },

  async updateAvatar(
    userId: string,
    workspaceId: string,
    file: Express.Multer.File,
  ) {
    const currentProfile = await profileRepository.findById(userId);

    if (!currentProfile || currentProfile.workspaceId !== workspaceId) {
      await deleteAvatarFile(buildAvatarUrl(file.filename));

      throw new ApiError(404, PROFILE_MESSAGES.notFound);
    }

    const avatarUrl = buildAvatarUrl(file.filename);

    const updated = await profileRepository.updateAvatar(userId, workspaceId, {
      avatarUrl,
    });

    if (!updated) {
      await deleteAvatarFile(avatarUrl);

      throw new ApiError(404, PROFILE_MESSAGES.notFound);
    }

    await deleteAvatarFile(currentProfile.avatarUrl);

    await recordProfileActivity({
      userId,
      workspaceId,

      type: PROFILE_ACTIVITY.avatarUpdated,

      title: "Avatar updated",

      description: "The profile avatar was updated.",
    });

    return mapProfile(updated);
  },

  async removeAvatar(userId: string, workspaceId: string) {
    const currentProfile = await profileRepository.findById(userId);

    if (!currentProfile || currentProfile.workspaceId !== workspaceId) {
      throw new ApiError(404, PROFILE_MESSAGES.notFound);
    }

    const updated = await profileRepository.updateAvatar(userId, workspaceId, {
      avatarUrl: null,
    });

    if (!updated) {
      throw new ApiError(404, PROFILE_MESSAGES.notFound);
    }

    await deleteAvatarFile(currentProfile.avatarUrl);

    await recordProfileActivity({
      userId,
      workspaceId,

      type: PROFILE_ACTIVITY.avatarUpdated,

      title: "Avatar removed",

      description: "The profile avatar was removed.",
    });

    return mapProfile(updated);
  },
};
