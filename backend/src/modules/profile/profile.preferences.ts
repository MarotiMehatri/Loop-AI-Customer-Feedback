import { ApiError } from "../../utils/apiError.js";

import { PROFILE_MESSAGES } from "./profile.constants.js";

import { PROFILE_ACTIVITY, recordProfileActivity } from "./profile.activity.js";

import { mapPreference } from "./profile.mapper.js";

import { profileRepository } from "./profile.repository.js";

import type { UpdatePreferencesInput } from "./profile.types.js";

export async function getProfilePreferences(userId: string) {
  const preference = await profileRepository.findPreferences(userId);

  if (!preference) {
    const created = await profileRepository.upsertPreferences(userId, {});

    return mapPreference(created);
  }

  return mapPreference(preference);
}

export async function updateProfilePreferences(
  userId: string,
  workspaceId: string,
  input: UpdatePreferencesInput,
) {
  const profile = await profileRepository.findById(userId);

  if (!profile || profile.workspaceId !== workspaceId) {
    throw new ApiError(404, PROFILE_MESSAGES.notFound);
  }

  const preference = await profileRepository.upsertPreferences(userId, input);

  await recordProfileActivity({
    userId,
    workspaceId,

    type: PROFILE_ACTIVITY.preferencesUpdated,

    title: "Profile preferences updated",

    description: "Notification and appearance preferences were updated.",

    metadata: {
      updatedFields: Object.keys(input),
    },
  });

  return mapPreference(preference);
}
