import type { Request, RequestHandler } from "express";

import { ApiError } from "../../utils/apiError.js";

import { SETTINGS_MESSAGES } from "./settings.constants.js";

import { settingsService } from "./settings.service.js";

import type {
  SettingsContext,
  SettingsSection,
  SettingsSectionUpdate,
} from "./settings.types.js";

function getSettingsContext(request: Request): SettingsContext {
  const userId = request.user?.userId;

  const workspaceId = request.workspaceId ?? request.user?.workspaceId;

  const role = request.user?.role;

  if (!userId || !role) {
    throw new ApiError(401, SETTINGS_MESSAGES.authenticationRequired);
  }

  if (!workspaceId) {
    throw new ApiError(400, SETTINGS_MESSAGES.workspaceRequired);
  }

  return {
    userId,
    workspaceId,
    role,
  };
}

function getSection(request: Request): SettingsSection {
  return request.params.section as SettingsSection;
}

export const settingsController: {
  getAll: RequestHandler;
  getSection: RequestHandler;
  updateSection: RequestHandler;
  resetSection: RequestHandler;
} = {
  getAll: async (request, response, next) => {
    try {
      const context = getSettingsContext(request);

      const result = await settingsService.getAll(context);

      response.status(200).json({
        success: true,
        message: SETTINGS_MESSAGES.retrieved,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  getSection: async (request, response, next) => {
    try {
      const context = getSettingsContext(request);

      const section = getSection(request);

      const result = await settingsService.getSection(context, section);

      response.status(200).json({
        success: true,

        message: SETTINGS_MESSAGES.sectionRetrieved,

        data: {
          section,
          values: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  updateSection: async (request, response, next) => {
    try {
      const context = getSettingsContext(request);

      const section = getSection(request);

      const result = await settingsService.updateSection(
        context,
        section,

        request.body as SettingsSectionUpdate,
      );

      response.status(200).json({
        success: true,
        message: SETTINGS_MESSAGES.updated,

        data: {
          section,
          values: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  resetSection: async (request, response, next) => {
    try {
      const context = getSettingsContext(request);

      const section = getSection(request);

      const result = await settingsService.resetSection(context, section);

      response.status(200).json({
        success: true,
        message: SETTINGS_MESSAGES.reset,

        data: {
          section,
          values: result,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
