import { profileRepository } from "./profile.repository.js";

import type { ProfileStatistics } from "./profile.types.js";

export async function getProfileStatistics(
  userId: string,
  workspaceId: string,
): Promise<ProfileStatistics> {
  return profileRepository.getStatistics(userId, workspaceId);
}
