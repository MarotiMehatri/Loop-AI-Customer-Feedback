import type { Request, Response } from "express";

import { ApiError } from "../../utils/apiError.js";

import { SETTINGS_MESSAGES } from "./settings.constants.js";

import { settingsService } from "./settings.service.js";

import type {
  SettingsContext,
  SettingsSection,
  SettingsSectionUpdate,
} from "./settings.types.js";

function getContext(request: Request): SettingsContext {
  const userId = request.user?.userId;
  const workspaceId = request.workspaceId ?? request.user?.workspaceId;
  const role = request.user?.role;

  if (!userId || !role) {
    throw new ApiError(401, SETTINGS_MESSAGES.authenticationRequired);
  }

  if (!workspaceId) {
    throw new ApiError(400, SETTINGS_MESSAGES.workspaceRequired);
  }

  return { userId, workspaceId, role };
}

function getSection(request: Request): SettingsSection {
  return request.params.section as SettingsSection;
}

export const getAllSettingsController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getContext(request);

  const result = await settingsService.getAll(context);

  response.status(200).json({
    success: true,
    message: SETTINGS_MESSAGES.retrieved,
    data: result,
  });
};

export const getSettingsSectionController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getContext(request);
  const section = getSection(request);

  const result = await settingsService.getSection(context, section);

  response.status(200).json({
    success: true,
    message: SETTINGS_MESSAGES.sectionRetrieved,
    data: { section, values: result },
  });
};

export const updateSettingsSectionController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getContext(request);
  const section = getSection(request);

  const result = await settingsService.updateSection(
    context,
    section,
    request.body as SettingsSectionUpdate,
  );

  response.status(200).json({
    success: true,
    message: SETTINGS_MESSAGES.updated,
    data: { section, values: result },
  });
};

export const resetSettingsSectionController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getContext(request);
  const section = getSection(request);

  const result = await settingsService.resetSection(context, section);

  response.status(200).json({
    success: true,
    message: SETTINGS_MESSAGES.reset,
    data: { section, values: result },
  });
};
