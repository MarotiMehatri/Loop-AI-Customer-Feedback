import type { Prisma, WorkspaceSettings } from "../../generated/prisma/client.js";

import {
  DEFAULT_AI_SETTINGS,
  DEFAULT_FEEDBACK_SETTINGS,
  DEFAULT_GENERAL_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_REPORT_SETTINGS,
  DEFAULT_RETENTION_SETTINGS,
  DEFAULT_SECURITY_SETTINGS,
} from "./settings.constants.js";

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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function removeUndefined<Value extends object>(value: Value): Partial<Value> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as Partial<Value>;
}

function normalizeText(value: string): string {
  return value.trim();
}

function normalizeDomains(domains: string[]): string[] {
  return [
    ...new Set(
      domains
        .map((domain) => domain.trim().toLowerCase().replace(/^@/, ""))
        .filter((domain) => domain.length > 0),
    ),
  ];
}

export function mergeStoredSettings<Value extends object>(
  defaults: Value,
  stored: Prisma.JsonValue,
): Value {
  if (!isPlainObject(stored)) {
    return { ...defaults };
  }

  return { ...defaults, ...stored } as Value;
}

export function toSettingsJson(
  value: SettingsSectionValue,
): Prisma.InputJsonValue {
  return value as unknown as Prisma.InputJsonValue;
}

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
  return mapSettings(settings)[section];
}

export function buildUpdatedSettingsSection(
  section: SettingsSection,
  current: SettingsSectionValue,
  input: Partial<SettingsSectionValue>,
): SettingsSectionValue {
  switch (section) {
    case "general": {
      const currentValue = current as GeneralSettings;
      const update = input as Partial<GeneralSettings>;

      return {
        ...currentValue,
        ...removeUndefined(update),
        ...(update.timezone !== undefined
          ? { timezone: normalizeText(update.timezone) }
          : {}),
        ...(update.locale !== undefined
          ? { locale: normalizeText(update.locale) }
          : {}),
      };
    }

    case "ai": {
      const currentValue = current as AiSettings;
      const update = input as Partial<AiSettings>;

      return {
        ...currentValue,
        ...removeUndefined(update),
        ...(update.model !== undefined
          ? { model: normalizeText(update.model) }
          : {}),
      };
    }

    case "feedback": {
      const currentValue = current as FeedbackSettings;
      const update = input as Partial<FeedbackSettings>;

      return {
        ...currentValue,
        ...removeUndefined(update),
      };
    }

    case "reports": {
      const currentValue = current as ReportSettings;
      const update = input as Partial<ReportSettings>;

      return {
        ...currentValue,
        ...removeUndefined(update),
      };
    }

    case "security": {
      const currentValue = current as SecuritySettings;
      const update = input as Partial<SecuritySettings>;

      return {
        ...currentValue,
        ...removeUndefined(update),
        ...(update.allowedEmailDomains !== undefined
          ? { allowedEmailDomains: normalizeDomains(update.allowedEmailDomains) }
          : {}),
      };
    }

    case "retention": {
      const currentValue = current as RetentionSettings;
      const update = input as Partial<RetentionSettings>;

      return {
        ...currentValue,
        ...removeUndefined(update),
      };
    }

    case "notifications": {
      const currentValue = current as WorkspaceNotificationSettings;
      const update = input as Partial<WorkspaceNotificationSettings>;

      return {
        ...currentValue,
        ...removeUndefined(update),
      };
    }
  }
}
