import { ActivityType } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

import { activityLogger } from "../activity/activity.logger.js";

import { THEME_MESSAGES } from "./theme.constants.js";

import { mapTheme, mapThemeFeedbackList } from "./theme.mapper.js";

import { themeRepository } from "./theme.repository.js";

import { themeFeedbackRepository } from "./theme-feedback.repository.js";

import type {
  AssignFeedbackInput,
  ThemeContext,
  ThemeFeedbackQuery,
} from "./theme.types.js";

export const themeFeedbackService = {
  async listFeedback(
    context: ThemeContext,
    themeId: string,
    query: ThemeFeedbackQuery,
  ) {
    const theme = await themeRepository.findById(themeId, context.workspaceId);

    if (!theme) {
      throw new ApiError(404, THEME_MESSAGES.notFound);
    }

    const result = await themeFeedbackRepository.listFeedback(
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
    const result = await themeFeedbackRepository.assignFeedback(
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
    const result = await themeFeedbackRepository.removeFeedback(
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
};
