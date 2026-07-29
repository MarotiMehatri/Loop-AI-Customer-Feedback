import type { Request, Response } from "express";

import { ApiError } from "../../utils/apiError.js";

import { PROFILE_MESSAGES } from "./profile.constants.js";

import { profileService } from "./profile.service.js";

import type {
  ChangePasswordInput,
  ProfileActivityQuery,
  UpdatePreferencesInput,
  UpdateProfileInput,
} from "./profile.types.js";

function getContext(request: Request): {
  userId: string;
  workspaceId: string;
} {
  const userId = request.user?.userId;
  const workspaceId = request.workspaceId ?? request.user?.workspaceId;

  if (!userId) {
    throw new ApiError(401, PROFILE_MESSAGES.authenticationRequired);
  }

  if (!workspaceId) {
    throw new ApiError(400, PROFILE_MESSAGES.workspaceRequired);
  }

  return { userId, workspaceId };
}

export const getProfileController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { userId, workspaceId } = getContext(request);

  const result = await profileService.getProfile(userId, workspaceId);

  response.status(200).json({
    success: true,
    message: PROFILE_MESSAGES.retrieved,
    data: result,
  });
};

export const updateProfileController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { userId, workspaceId } = getContext(request);

  const result = await profileService.updateProfile(
    userId,
    workspaceId,
    request.body as UpdateProfileInput,
  );

  response.status(200).json({
    success: true,
    message: PROFILE_MESSAGES.updated,
    data: result,
  });
};

export const updateAvatarController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { userId, workspaceId } = getContext(request);

  if (!request.file) {
    throw new ApiError(400, PROFILE_MESSAGES.avatarRequired);
  }

  const result = await profileService.updateAvatar(
    userId,
    workspaceId,
    request.file,
  );

  response.status(200).json({
    success: true,
    message: PROFILE_MESSAGES.avatarUpdated,
    data: result,
  });
};

export const removeAvatarController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { userId, workspaceId } = getContext(request);

  const result = await profileService.removeAvatar(userId, workspaceId);

  response.status(200).json({
    success: true,
    message: PROFILE_MESSAGES.avatarRemoved,
    data: result,
  });
};

export const getPreferencesController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { userId } = getContext(request);

  const result = await profileService.getPreferences(userId);

  response.status(200).json({
    success: true,
    message: PROFILE_MESSAGES.preferencesRetrieved,
    data: result,
  });
};

export const updatePreferencesController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { userId, workspaceId } = getContext(request);

  const result = await profileService.updatePreferences(
    userId,
    workspaceId,
    request.body as UpdatePreferencesInput,
  );

  response.status(200).json({
    success: true,
    message: PROFILE_MESSAGES.preferencesUpdated,
    data: result,
  });
};

export const changePasswordController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { userId, workspaceId } = getContext(request);

  await profileService.changePassword(
    userId,
    workspaceId,
    request.body as ChangePasswordInput,
  );

  response.status(200).json({
    success: true,
    message: PROFILE_MESSAGES.passwordUpdated,
  });
};

export const getStatisticsController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { userId, workspaceId } = getContext(request);

  const result = await profileService.getStatistics(userId, workspaceId);

  response.status(200).json({
    success: true,
    message: PROFILE_MESSAGES.statisticsRetrieved,
    data: result,
  });
};

export const getActivityController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { userId, workspaceId } = getContext(request);

  const result = await profileService.getActivity(
    userId,
    workspaceId,
    request.query as unknown as ProfileActivityQuery,
  );

  response.status(200).json({
    success: true,
    message: PROFILE_MESSAGES.activityRetrieved,
    data: result,
  });
};
