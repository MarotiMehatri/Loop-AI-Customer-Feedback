import type { Request, Response } from "express";

import { ApiError } from "../../utils/apiError.js";

import { THEME_MESSAGES } from "./theme.constants.js";

import { themeService } from "./theme.service.js";

import type {
  AssignFeedbackInput,
  CreateThemeInput,
  GenerateThemesInput,
  ThemeContext,
  ThemeFeedbackQuery,
  ThemeListQuery,
  UpdateThemeInput,
} from "./theme.types.js";

function getThemeContext(request: Request): ThemeContext {
  const userId = request.user?.userId;
  const workspaceId = request.workspaceId ?? request.user?.workspaceId;
  const role = request.user?.role;

  if (!userId || !role) {
    throw new ApiError(401, THEME_MESSAGES.authenticationRequired);
  }

  if (!workspaceId) {
    throw new ApiError(400, THEME_MESSAGES.workspaceRequired);
  }

  return { userId, workspaceId, role };
}

function getThemeId(request: Request): string {
  return request.params.themeId as string;
}

export const createController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getThemeContext(request);

  const result = await themeService.create(
    context,
    request.body as CreateThemeInput,
  );

  response.status(201).json({
    success: true,
    message: THEME_MESSAGES.created,
    data: result,
  });
};

export const listController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getThemeContext(request);

  const result = await themeService.list(
    context,
    request.query as unknown as ThemeListQuery,
  );

  response.status(200).json({
    success: true,
    message: THEME_MESSAGES.listed,
    data: result,
  });
};

export const getByIdController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getThemeContext(request);

  const result = await themeService.getById(context, getThemeId(request));

  response.status(200).json({
    success: true,
    message: THEME_MESSAGES.retrieved,
    data: result,
  });
};

export const updateController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getThemeContext(request);

  const result = await themeService.update(
    context,
    getThemeId(request),
    request.body as UpdateThemeInput,
  );

  response.status(200).json({
    success: true,
    message: THEME_MESSAGES.updated,
    data: result,
  });
};

export const removeController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getThemeContext(request);

  await themeService.remove(context, getThemeId(request));

  response.status(200).json({
    success: true,
    message: THEME_MESSAGES.deleted,
  });
};

export const summaryController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getThemeContext(request);

  const result = await themeService.getSummary(context);

  response.status(200).json({
    success: true,
    message: THEME_MESSAGES.summaryRetrieved,
    data: result,
  });
};

export const analyticsController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getThemeContext(request);

  const result = await themeService.getAnalytics(context, getThemeId(request));

  response.status(200).json({
    success: true,
    message: THEME_MESSAGES.analyticsRetrieved,
    data: result,
  });
};

export const listFeedbackController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getThemeContext(request);

  const result = await themeService.listFeedback(
    context,
    getThemeId(request),
    request.query as unknown as ThemeFeedbackQuery,
  );

  response.status(200).json({
    success: true,
    message: THEME_MESSAGES.feedbackRetrieved,
    data: result,
  });
};

export const assignFeedbackController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getThemeContext(request);

  const result = await themeService.assignFeedback(
    context,
    getThemeId(request),
    request.params.feedbackId as string,
    request.body as AssignFeedbackInput,
  );

  response.status(200).json({
    success: true,
    message: THEME_MESSAGES.feedbackAssigned,
    data: result,
  });
};

export const removeFeedbackController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getThemeContext(request);

  await themeService.removeFeedback(
    context,
    getThemeId(request),
    request.params.feedbackId as string,
  );

  response.status(200).json({
    success: true,
    message: THEME_MESSAGES.feedbackRemoved,
  });
};

export const generateController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getThemeContext(request);

  const result = await themeService.generate(
    context,
    request.body as GenerateThemesInput,
  );

  response.status(201).json({
    success: true,
    message:
      result.generatedCount > 0
        ? THEME_MESSAGES.generated
        : THEME_MESSAGES.noCandidates,
    data: result,
  });
};
