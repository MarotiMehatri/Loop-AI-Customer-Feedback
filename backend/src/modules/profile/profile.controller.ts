import type { Request, RequestHandler } from "express";

import { ApiError } from "../../utils/apiError.js";

import { PROFILE_MESSAGES } from "./profile.constants.js";

import { getProfileActivity } from "./profile.activity.js";

import {
  getProfilePreferences,
  updateProfilePreferences,
} from "./profile.preferences.js";

import { changeProfilePassword } from "./profile.security.js";

import { profileService } from "./profile.service.js";

import { getProfileStatistics } from "./profile.statistics.js";

import type {
  ChangePasswordInput,
  ProfileActivityQuery,
  UpdatePreferencesInput,
  UpdateProfileInput,
} from "./profile.types.js";

function getProfileContext(request: Request): {
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

  return {
    userId,
    workspaceId,
  };
}

export const profileController: {
  getProfile: RequestHandler;
  updateProfile: RequestHandler;
  updateAvatar: RequestHandler;
  removeAvatar: RequestHandler;
  getPreferences: RequestHandler;
  updatePreferences: RequestHandler;
  changePassword: RequestHandler;
  getStatistics: RequestHandler;
  getActivity: RequestHandler;
} = {
  getProfile: async (request, response, next) => {
    try {
      const { userId, workspaceId } = getProfileContext(request);

      const result = await profileService.getProfile(userId, workspaceId);

      response.status(200).json({
        success: true,
        message: PROFILE_MESSAGES.retrieved,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  updateProfile: async (request, response, next) => {
    try {
      const { userId, workspaceId } = getProfileContext(request);

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
    } catch (error) {
      next(error);
    }
  },

  updateAvatar: async (request, response, next) => {
    try {
      const { userId, workspaceId } = getProfileContext(request);

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
    } catch (error) {
      next(error);
    }
  },

  removeAvatar: async (request, response, next) => {
    try {
      const { userId, workspaceId } = getProfileContext(request);

      const result = await profileService.removeAvatar(userId, workspaceId);

      response.status(200).json({
        success: true,
        message: PROFILE_MESSAGES.avatarRemoved,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  getPreferences: async (request, response, next) => {
    try {
      const { userId } = getProfileContext(request);

      const result = await getProfilePreferences(userId);

      response.status(200).json({
        success: true,
        message: PROFILE_MESSAGES.preferencesRetrieved,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  updatePreferences: async (request, response, next) => {
    try {
      const { userId, workspaceId } = getProfileContext(request);

      const result = await updateProfilePreferences(
        userId,
        workspaceId,
        request.body as UpdatePreferencesInput,
      );

      response.status(200).json({
        success: true,
        message: PROFILE_MESSAGES.preferencesUpdated,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  changePassword: async (request, response, next) => {
    try {
      const { userId, workspaceId } = getProfileContext(request);

      await changeProfilePassword(
        userId,
        workspaceId,
        request.body as ChangePasswordInput,
      );

      response.status(200).json({
        success: true,
        message: PROFILE_MESSAGES.passwordUpdated,
      });
    } catch (error) {
      next(error);
    }
  },

  getStatistics: async (request, response, next) => {
    try {
      const { userId, workspaceId } = getProfileContext(request);

      const result = await getProfileStatistics(userId, workspaceId);

      response.status(200).json({
        success: true,
        message: PROFILE_MESSAGES.statisticsRetrieved,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  getActivity: async (request, response, next) => {
    try {
      const { userId, workspaceId } = getProfileContext(request);

      const result = await getProfileActivity(
        userId,
        workspaceId,
        request.query as unknown as ProfileActivityQuery,
      );

      response.status(200).json({
        success: true,
        message: PROFILE_MESSAGES.activityRetrieved,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
