import * as bcrypt from "bcryptjs";

import { ApiError } from "../../utils/apiError.js";

import { PROFILE_MESSAGES } from "./profile.constants.js";

import { PROFILE_ACTIVITY, recordProfileActivity } from "./profile.activity.js";

import { profileRepository } from "./profile.repository.js";

import type { ChangePasswordInput } from "./profile.types.js";

const PASSWORD_SALT_ROUNDS = 12;

export async function changeProfilePassword(
  userId: string,
  workspaceId: string,
  input: ChangePasswordInput,
): Promise<void> {
  const user = await profileRepository.findPasswordHash(userId, workspaceId);

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

    type: PROFILE_ACTIVITY.passwordChanged,

    title: "Password changed",

    description: "The account password was changed successfully.",
  });
}
