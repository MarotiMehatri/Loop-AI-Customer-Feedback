import { ActivityType } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

import { activityLogger } from "../activity/activity.logger.js";

import { getThemeAnalytics } from "./theme.analytics.js";

import { THEME_MESSAGES } from "./theme.constants.js";

import {
  normalizeThemeColor,
  normalizeThemeDescription,
  normalizeThemeName,
} from "./theme.helper.js";

import {
  mapTheme,
  mapThemeList,
} from "./theme.mapper.js";

import { themeRepository } from "./theme.repository.js";

import type {
  CreateThemeInput,
  ThemeContext,
  ThemeListQuery,
  UpdateThemeInput,
} from "./theme.types.js";

function isUniqueConstraintError(error: unknown): boolean {
  const prismaError = error as { code?: string };
  return prismaError?.code === "P2002";
}

export const themeCrudService = {
  async create(context: ThemeContext, input: CreateThemeInput) {
    const normalizedInput: CreateThemeInput = {
      name: normalizeThemeName(input.name),
      description: normalizeThemeDescription(input.description),
      color: normalizeThemeColor(input.color),
      status: input.status,
    };

    const duplicate = await themeRepository.findByName(
      normalizedInput.name,
      context.workspaceId,
    );

    if (duplicate) {
      throw new ApiError(409, THEME_MESSAGES.duplicateName);
    }

    try {
      const theme = await themeRepository.create(
        context.workspaceId,
        normalizedInput,
      );

      await activityLogger.logSafe({
        userId: context.userId,
        workspaceId: context.workspaceId,
        type: ActivityType.THEME_CREATED,
        title: "Theme created",
        description: `Theme "${theme.name}" was created.`,
        entityType: "THEME",
        entityId: theme.id,
        metadata: {
          isAiGenerated: false,
        },
      });

      return mapTheme(theme);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ApiError(409, THEME_MESSAGES.duplicateName);
      }

      throw error;
    }
  },

  async list(context: ThemeContext, query: ThemeListQuery) {
    const result = await themeRepository.list(context.workspaceId, query);

    return {
      items: mapThemeList(result.items),
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  },

  async getById(context: ThemeContext, themeId: string) {
    const theme = await themeRepository.findById(themeId, context.workspaceId);

    if (!theme) {
      throw new ApiError(404, THEME_MESSAGES.notFound);
    }

    return mapTheme(theme);
  },

  async update(
    context: ThemeContext,
    themeId: string,
    input: UpdateThemeInput,
  ) {
    const existing = await themeRepository.findById(
      themeId,
      context.workspaceId,
    );

    if (!existing) {
      throw new ApiError(404, THEME_MESSAGES.notFound);
    }

    const normalizedInput: UpdateThemeInput = {
      name:
        input.name !== undefined ? normalizeThemeName(input.name) : undefined,
      description: normalizeThemeDescription(input.description),
      color: normalizeThemeColor(input.color),
      status: input.status,
    };

    if (
      normalizedInput.name &&
      normalizedInput.name.toLowerCase() !== existing.name.toLowerCase()
    ) {
      const duplicate = await themeRepository.findByName(
        normalizedInput.name,
        context.workspaceId,
      );

      if (duplicate && duplicate.id !== themeId) {
        throw new ApiError(409, THEME_MESSAGES.duplicateName);
      }
    }

    try {
      const updated = await themeRepository.update(
        themeId,
        context.workspaceId,
        normalizedInput,
      );

      if (!updated) {
        throw new ApiError(404, THEME_MESSAGES.notFound);
      }

      await activityLogger.logSafe({
        userId: context.userId,
        workspaceId: context.workspaceId,
        type: ActivityType.THEME_UPDATED,
        title: "Theme updated",
        description: `Theme "${updated.name}" was updated.`,
        entityType: "THEME",
        entityId: updated.id,
        metadata: {
          updatedFields: Object.keys(input),
        },
      });

      return mapTheme(updated);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ApiError(409, THEME_MESSAGES.duplicateName);
      }

      throw error;
    }
  },

  async remove(context: ThemeContext, themeId: string): Promise<void> {
    const theme = await themeRepository.findById(themeId, context.workspaceId);

    if (!theme) {
      throw new ApiError(404, THEME_MESSAGES.notFound);
    }

    const result = await themeRepository.remove(themeId, context.workspaceId);

    if (result.count === 0) {
      throw new ApiError(404, THEME_MESSAGES.notFound);
    }

    await activityLogger.logSafe({
      userId: context.userId,
      workspaceId: context.workspaceId,
      type: ActivityType.THEME_DELETED,
      title: "Theme deleted",
      description: `Theme "${theme.name}" was deleted.`,
      entityType: "THEME",
      entityId: theme.id,
      metadata: {
        feedbackCount: theme._count.feedbackThemes,
      },
    });
  },

  async getSummary(context: ThemeContext) {
    return themeRepository.getSummary(context.workspaceId);
  },

  async getAnalytics(context: ThemeContext, themeId: string) {
    const result = await getThemeAnalytics(themeId, context.workspaceId);

    if (!result) {
      throw new ApiError(404, THEME_MESSAGES.notFound);
    }

    return result;
  },
};
