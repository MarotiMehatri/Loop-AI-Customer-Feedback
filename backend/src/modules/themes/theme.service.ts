import {
  assertCanDeleteThemes,
  assertCanManageThemes,
  assertCanReadThemes,
} from "./theme.permissions.js";

import { themeCrudService } from "./theme-crud.service.js";

import { themeFeedbackService } from "./theme-feedback.service.js";

import { themeGenerationService } from "./theme-generation.service.js";

import type {
  AssignFeedbackInput,
  CreateThemeInput,
  GenerateThemesInput,
  ThemeContext,
  ThemeFeedbackQuery,
  ThemeListQuery,
  UpdateThemeInput,
} from "./theme.types.js";

export const themeService = {
  async create(context: ThemeContext, input: CreateThemeInput) {
    assertCanManageThemes(context.role);
    return themeCrudService.create(context, input);
  },

  async list(context: ThemeContext, query: ThemeListQuery) {
    assertCanReadThemes(context.role);
    return themeCrudService.list(context, query);
  },

  async getById(context: ThemeContext, themeId: string) {
    assertCanReadThemes(context.role);
    return themeCrudService.getById(context, themeId);
  },

  async update(
    context: ThemeContext,
    themeId: string,
    input: UpdateThemeInput,
  ) {
    assertCanManageThemes(context.role);
    return themeCrudService.update(context, themeId, input);
  },

  async remove(context: ThemeContext, themeId: string): Promise<void> {
    assertCanDeleteThemes(context.role);
    return themeCrudService.remove(context, themeId);
  },

  async getSummary(context: ThemeContext) {
    assertCanReadThemes(context.role);
    return themeCrudService.getSummary(context);
  },

  async getAnalytics(context: ThemeContext, themeId: string) {
    assertCanReadThemes(context.role);
    return themeCrudService.getAnalytics(context, themeId);
  },

  async listFeedback(
    context: ThemeContext,
    themeId: string,
    query: ThemeFeedbackQuery,
  ) {
    assertCanReadThemes(context.role);
    return themeFeedbackService.listFeedback(context, themeId, query);
  },

  async assignFeedback(
    context: ThemeContext,
    themeId: string,
    feedbackId: string,
    input: AssignFeedbackInput,
  ) {
    assertCanManageThemes(context.role);
    return themeFeedbackService.assignFeedback(
      context,
      themeId,
      feedbackId,
      input,
    );
  },

  async removeFeedback(
    context: ThemeContext,
    themeId: string,
    feedbackId: string,
  ): Promise<void> {
    assertCanManageThemes(context.role);
    return themeFeedbackService.removeFeedback(context, themeId, feedbackId);
  },

  async generate(context: ThemeContext, input: GenerateThemesInput) {
    assertCanManageThemes(context.role);
    return themeGenerationService.generate(context, input);
  },
};
