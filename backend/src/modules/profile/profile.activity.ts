import { ActivityType } from "../../generated/prisma/client.js";

import { profileRepository } from "./profile.repository.js";

import type {
  ProfileActivityInput,
  ProfileActivityQuery,
} from "./profile.types.js";

export async function recordProfileActivity(
  input: ProfileActivityInput,
): Promise<void> {
  await profileRepository.createActivity(input);
}

export async function getProfileActivity(
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

export const PROFILE_ACTIVITY = {
  profileUpdated: ActivityType.PROFILE_UPDATED,

  passwordChanged: ActivityType.PASSWORD_CHANGED,

  avatarUpdated: ActivityType.AVATAR_UPDATED,

  preferencesUpdated: ActivityType.PREFERENCES_UPDATED,
} as const;
