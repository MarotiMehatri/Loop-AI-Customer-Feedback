import type { Prisma } from "../../generated/prisma/client.js";

import type { ThemeFeedbackResponse, ThemeResponse } from "./theme.types.js";

export type ThemeRecord = Prisma.ThemeGetPayload<{
  include: {
    _count: {
      select: {
        feedbackThemes: true;
      };
    };
  };
}>;

export type ThemeFeedbackRecord = Prisma.FeedbackThemeGetPayload<{
  select: {
    confidence: true;
    feedback: {
      select: {
        id: true;
        content: true;
        sentiment: true;
        createdAt: true;
      };
    };
  };
}>;

export function mapTheme(theme: ThemeRecord): ThemeResponse {
  return {
    id: theme.id,
    name: theme.name,
    description: theme.description,
    status: theme.status,
    color: theme.color,
    isAiGenerated: theme.isAiGenerated,
    feedbackCount: theme._count.feedbackThemes,
    workspaceId: theme.workspaceId,
    createdAt: theme.createdAt,
    updatedAt: theme.updatedAt,
  };
}

export function mapThemeList(themes: ThemeRecord[]): ThemeResponse[] {
  return themes.map(mapTheme);
}

export function mapThemeFeedback(
  record: ThemeFeedbackRecord,
): ThemeFeedbackResponse {
  return {
    feedbackId: record.feedback.id,
    content: record.feedback.content,
    sentiment: String(record.feedback.sentiment),
    confidence: Number(record.confidence ?? 0),
    createdAt: record.feedback.createdAt,
  };
}

export function mapThemeFeedbackList(
  records: ThemeFeedbackRecord[],
): ThemeFeedbackResponse[] {
  return records.map(mapThemeFeedback);
}
