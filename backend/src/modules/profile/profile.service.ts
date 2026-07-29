import * as bcrypt from "bcryptjs";

import { ActivityType, type ActivityType as TActivityType } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

import { buildAvatarUrl, deleteAvatarFile } from "./profile-avatar.service.js";

import { PROFILE_MESSAGES } from "./profile.constants.js";

import { mapPreference, mapProfile } from "./profile.mapper.js";

import { profileRepository } from "./profile.repository.js";

import type {
  ChangePasswordInput,
  ProfileActivityQuery,
  ProfileStatistics,
  UpdatePreferencesInput,
  UpdateProfileInput,
} from "./profile.types.js";

function normalizeProfileName(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeOptionalText(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizePhone(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeTimezone(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

async function recordProfileActivity(input: {
  userId: string;
  workspaceId: string;
  type: TActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await profileRepository.createActivity(input);
}

async function getProfileActivity(
  userId: string,
  workspaceId: string,
  query: ProfileActivityQuery,
) {
  const result = await profileRepository.listActivity(
    userId,
    workspaceId,
    query,
  );

  return {
    items: result.items.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      metadata: item.metadata,
      createdAt: item.createdAt,
    })),

    pagination: {
      page: query.page,
      limit: query.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / query.limit),
    },
  };
}

const PASSWORD_SALT_ROUNDS = 12;

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
    const updated = await profileRepository.updateProfile(
      userId,
      workspaceId,
      {
        name:
          input.name !== undefined
            ? normalizeProfileName(input.name)
            : undefined,
        phone: normalizePhone(input.phone),
        bio: normalizeOptionalText(input.bio),
        jobTitle: normalizeOptionalText(input.jobTitle),
        department: normalizeOptionalText(input.department),
        location: normalizeOptionalText(input.location),
        timezone: normalizeTimezone(input.timezone),
      },
    );

    if (!updated) {
      throw new ApiError(404, PROFILE_MESSAGES.notFound);
    }

    await recordProfileActivity({
      userId,
      workspaceId,
      type: ActivityType.PROFILE_UPDATED,
      title: "Profile updated",
      description: "Personal profile information was updated.",
      metadata: { updatedFields: Object.keys(input) },
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

    const updated = await profileRepository.updateAvatar(
      userId,
      workspaceId,
      { avatarUrl },
    );

    if (!updated) {
      await deleteAvatarFile(avatarUrl);
      throw new ApiError(404, PROFILE_MESSAGES.notFound);
    }

    await deleteAvatarFile(currentProfile.avatarUrl);

    await recordProfileActivity({
      userId,
      workspaceId,
      type: ActivityType.AVATAR_UPDATED,
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

    const updated = await profileRepository.updateAvatar(
      userId,
      workspaceId,
      { avatarUrl: null },
    );

    if (!updated) {
      throw new ApiError(404, PROFILE_MESSAGES.notFound);
    }

    await deleteAvatarFile(currentProfile.avatarUrl);

    await recordProfileActivity({
      userId,
      workspaceId,
      type: ActivityType.AVATAR_UPDATED,
      title: "Avatar removed",
      description: "The profile avatar was removed.",
    });

    return mapProfile(updated);
  },

  async getPreferences(userId: string) {
    const preference = await profileRepository.findPreferences(userId);

    if (!preference) {
      const created = await profileRepository.upsertPreferences(userId, {});
      return mapPreference(created);
    }

    return mapPreference(preference);
  },

  async updatePreferences(
    userId: string,
    workspaceId: string,
    input: UpdatePreferencesInput,
  ) {
    const profile = await profileRepository.findById(userId);

    if (!profile || profile.workspaceId !== workspaceId) {
      throw new ApiError(404, PROFILE_MESSAGES.notFound);
    }

    const preference = await profileRepository.upsertPreferences(
      userId,
      input,
    );

    await recordProfileActivity({
      userId,
      workspaceId,
      type: ActivityType.PREFERENCES_UPDATED,
      title: "Profile preferences updated",
      description: "Notification and appearance preferences were updated.",
      metadata: { updatedFields: Object.keys(input) },
    });

    return mapPreference(preference);
  },

  async changePassword(
    userId: string,
    workspaceId: string,
    input: ChangePasswordInput,
  ): Promise<void> {
    const user = await profileRepository.findPasswordHash(
      userId,
      workspaceId,
    );

    if (!user) {
      throw new ApiError(404, PROFILE_MESSAGES.notFound);
    }

    const currentPasswordValid = await bcrypt.compare(
      input.currentPassword,
      user.passwordHash,
    );

    if (!currentPasswordValid) {
      throw new ApiError(400, PROFILE_MESSAGES.invalidCurrentPassword);
    }

    const samePassword = await bcrypt.compare(
      input.newPassword,
      user.passwordHash,
    );

    if (samePassword) {
      throw new ApiError(400, PROFILE_MESSAGES.samePassword);
    }

    const newPasswordHash = await bcrypt.hash(
      input.newPassword,
      PASSWORD_SALT_ROUNDS,
    );

    const result = await profileRepository.updatePassword(
      userId,
      workspaceId,
      newPasswordHash,
    );

    if (result.count === 0) {
      throw new ApiError(404, PROFILE_MESSAGES.notFound);
    }

    await recordProfileActivity({
      userId,
      workspaceId,
      type: ActivityType.PASSWORD_CHANGED,
      title: "Password changed",
      description: "The account password was changed successfully.",
    });
  },

  async getStatistics(
    userId: string,
    workspaceId: string,
  ): Promise<ProfileStatistics> {
    return profileRepository.getStatistics(userId, workspaceId);
  },

  async getActivity(
    userId: string,
    workspaceId: string,
    query: ProfileActivityQuery,
  ) {
    return getProfileActivity(userId, workspaceId, query);
  },
};
