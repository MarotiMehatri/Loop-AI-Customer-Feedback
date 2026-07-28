import { ActivityType } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

import { activityLogger } from "../activity/activity.logger.js";

import { buildThemeAiFeedback, generateThemeCandidates } from "./theme.ai.js";

import { THEME_MESSAGES } from "./theme.constants.js";

import { mapThemeList } from "./theme.mapper.js";

import { themeGenerationRepository } from "./theme-generation.repository.js";

import type {
  GenerateThemesInput,
  ThemeContext,
} from "./theme.types.js";

export const themeGenerationService = {
  async generate(context: ThemeContext, input: GenerateThemesInput) {
    const feedback = await themeGenerationRepository.findFeedbackForGeneration(
      context.workspaceId,
      input.feedbackLimit,
    );

    if (feedback.length === 0) {
      throw new ApiError(400, THEME_MESSAGES.noFeedback);
    }

    const existingThemeNames =
      await themeGenerationRepository.findExistingNames(context.workspaceId);

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

    const themes = await themeGenerationRepository.createGeneratedBatch(
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
