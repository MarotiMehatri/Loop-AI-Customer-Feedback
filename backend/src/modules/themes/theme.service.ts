import {
  Prisma,
  ActivityType,
  Role,
} from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

import { activityLogger } from "../activity/activity.logger.js";

import { buildThemeAiFeedback, generateThemeCandidates } from "./theme.ai.js";

import { getThemeAnalytics } from "./theme.analytics.js";

import { THEME_MESSAGES } from "./theme.constants.js";

import {
  normalizeThemeColor,
  normalizeThemeDescription,
  normalizeThemeName,
} from "./theme.helper.js";

import {
  mapTheme,
  mapThemeFeedbackList,
  mapThemeList,
} from "./theme.mapper.js";

import { themeRepository } from "./theme.repository.js";

import type {
  AssignFeedbackInput,
  CreateThemeInput,
  GenerateThemesInput,
  ThemeContext,
  ThemeFeedbackQuery,
  ThemeListQuery,
  UpdateThemeInput,
} from "./theme.types.js";

function assertCanManageThemes(context: ThemeContext): void {
  if (context.role !== Role.ADMIN && context.role !== Role.ANALYST) {
    throw new ApiError(403, THEME_MESSAGES.manageForbidden);
  }
}

function assertCanDeleteThemes(context: ThemeContext): void {
  if (context.role !== Role.ADMIN) {
    throw new ApiError(403, THEME_MESSAGES.deleteForbidden);
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export const themeService = {
  async create(context: ThemeContext, input: CreateThemeInput) {
    assertCanManageThemes(context);

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
    assertCanManageThemes(context);

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
    assertCanDeleteThemes(context);

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

  async listFeedback(
    context: ThemeContext,
    themeId: string,
    query: ThemeFeedbackQuery,
  ) {
    const theme = await themeRepository.findById(themeId, context.workspaceId);

    if (!theme) {
      throw new ApiError(404, THEME_MESSAGES.notFound);
    }

    const result = await themeRepository.listFeedback(
      themeId,
      context.workspaceId,
      query,
    );

    return {
      theme: mapTheme(theme),
      items: mapThemeFeedbackList(result.items),
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  },

  async assignFeedback(
    context: ThemeContext,
    themeId: string,
    feedbackId: string,
    input: AssignFeedbackInput,
  ) {
    assertCanManageThemes(context);

    const result = await themeRepository.assignFeedback(
      themeId,
      feedbackId,
      context.workspaceId,
      input,
    );

    if (result.status === "THEME_NOT_FOUND") {
      throw new ApiError(404, THEME_MESSAGES.notFound);
    }

    if (result.status === "FEEDBACK_NOT_FOUND") {
      throw new ApiError(404, THEME_MESSAGES.feedbackNotFound);
    }

    await activityLogger.logSafe({
      userId: context.userId,
      workspaceId: context.workspaceId,
      type: ActivityType.THEME_UPDATED,
      title: "Feedback assigned to theme",
      description: "A feedback item was assigned to a theme.",
      entityType: "THEME",
      entityId: themeId,
      metadata: {
        action: "FEEDBACK_ASSIGNED",
        feedbackId,
        confidence: input.confidence ?? 1,
      },
    });

    return {
      themeId,
      feedbackId,
      confidence: input.confidence ?? 1,
    };
  },

  async removeFeedback(
    context: ThemeContext,
    themeId: string,
    feedbackId: string,
  ): Promise<void> {
    assertCanManageThemes(context);

    const result = await themeRepository.removeFeedback(
      themeId,
      feedbackId,
      context.workspaceId,
    );

    if (result.status === "THEME_NOT_FOUND") {
      throw new ApiError(404, THEME_MESSAGES.notFound);
    }

    if (result.count === 0) {
      throw new ApiError(404, THEME_MESSAGES.assignmentNotFound);
    }

    await activityLogger.logSafe({
      userId: context.userId,
      workspaceId: context.workspaceId,
      type: ActivityType.THEME_UPDATED,
      title: "Feedback removed from theme",
      description: "A feedback item was removed from a theme.",
      entityType: "THEME",
      entityId: themeId,
      metadata: {
        action: "FEEDBACK_REMOVED",
        feedbackId,
      },
    });
  },

  async generate(context: ThemeContext, input: GenerateThemesInput) {
    assertCanManageThemes(context);

    const feedback = await themeRepository.findFeedbackForGeneration(
      context.workspaceId,
      input.feedbackLimit,
    );

    if (feedback.length === 0) {
      throw new ApiError(400, THEME_MESSAGES.noFeedback);
    }

    const existingThemeNames = await themeRepository.findExistingNames(
      context.workspaceId,
    );

    const candidates = await generateThemeCandidates({
      feedback: buildThemeAiFeedback(feedback),
      existingThemeNames,
      maxThemes: input.maxThemes,
      minClusterSize: input.minClusterSize,
    });

    if (candidates.length === 0) {
      return {
        generatedCount: 0,
        analyzedFeedbackCount: feedback.length,
        themes: [],
      };
    }

    const themes = await themeRepository.createGeneratedBatch(
      context.workspaceId,
      candidates,
    );

    await activityLogger.logSafe({
      userId: context.userId,
      workspaceId: context.workspaceId,
      type: ActivityType.THEME_GENERATED,
      title: "AI themes generated",
      description: `${themes.length} theme(s) were generated from customer feedback.`,
      entityType: "THEME",
      entityId: context.workspaceId,
      metadata: {
        generatedCount: themes.length,
        analyzedFeedbackCount: feedback.length,
        themeIds: themes.map((theme) => theme.id),
      },
    });

    return {
      generatedCount: themes.length,
      analyzedFeedbackCount: feedback.length,
      themes: mapThemeList(themes),
    };
  },
};
