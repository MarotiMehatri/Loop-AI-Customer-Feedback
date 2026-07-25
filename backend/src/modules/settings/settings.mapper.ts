import type { WorkspaceSettings } from "../../generated/prisma/client.js";

import {
  DEFAULT_AI_SETTINGS,
  DEFAULT_FEEDBACK_SETTINGS,
  DEFAULT_GENERAL_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_REPORT_SETTINGS,
  DEFAULT_RETENTION_SETTINGS,
  DEFAULT_SECURITY_SETTINGS,
} from "./settings.defaults.js";

import { mergeStoredSettings } from "./settings.helper.js";

import type {
  AiSettings,
  FeedbackSettings,
  GeneralSettings,
  ReportSettings,
  RetentionSettings,
  SecuritySettings,
  SettingsResponse,
  SettingsSection,
  SettingsSectionValue,
  WorkspaceNotificationSettings,
} from "./settings.types.js";

export function mapSettings(settings: WorkspaceSettings): SettingsResponse {
  return {
    id: settings.id,
    workspaceId: settings.workspaceId,

    general: mergeStoredSettings<GeneralSettings>(
      DEFAULT_GENERAL_SETTINGS,
      settings.general,
    ),

    ai: mergeStoredSettings<AiSettings>(DEFAULT_AI_SETTINGS, settings.ai),

    feedback: mergeStoredSettings<FeedbackSettings>(
      DEFAULT_FEEDBACK_SETTINGS,
      settings.feedback,
    ),

    reports: mergeStoredSettings<ReportSettings>(
      DEFAULT_REPORT_SETTINGS,
      settings.reports,
    ),

    security: mergeStoredSettings<SecuritySettings>(
      DEFAULT_SECURITY_SETTINGS,
      settings.security,
    ),

    retention: mergeStoredSettings<RetentionSettings>(
      DEFAULT_RETENTION_SETTINGS,
      settings.retention,
    ),

    notifications: mergeStoredSettings<WorkspaceNotificationSettings>(
      DEFAULT_NOTIFICATION_SETTINGS,
      settings.notifications,
    ),

    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  };
}

export function mapSettingsSection(
  settings: WorkspaceSettings,
  section: SettingsSection,
): SettingsSectionValue {
  const mapped = mapSettings(settings);

  return mapped[section];
}
