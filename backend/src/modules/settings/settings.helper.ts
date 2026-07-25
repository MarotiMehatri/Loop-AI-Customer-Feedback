import type { Prisma } from "../../generated/prisma/client.js";

import type {
  AiSettings,
  FeedbackSettings,
  GeneralSettings,
  ReportSettings,
  RetentionSettings,
  SecuritySettings,
  SettingsSection,
  SettingsSectionUpdate,
  SettingsSectionValue,
  WorkspaceNotificationSettings,
} from "./settings.types.js";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mergeStoredSettings<Value extends object>(
  defaults: Value,
  stored: Prisma.JsonValue,
): Value {
  if (!isPlainObject(stored)) {
    return {
      ...defaults,
    };
  }

  return {
    ...defaults,
    ...stored,
  } as Value;
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

export function toSettingsJson(
  value: SettingsSectionValue,
): Prisma.InputJsonValue {
  return value as unknown as Prisma.InputJsonValue;
}

export function buildUpdatedSettingsSection(
  section: SettingsSection,
  current: SettingsSectionValue,
  input: SettingsSectionUpdate,
): SettingsSectionValue {
  switch (section) {
    case "general": {
      const currentValue = current as GeneralSettings;

      const update = input as Partial<GeneralSettings>;

      return {
        ...currentValue,
        ...removeUndefined(update),

        ...(update.timezone !== undefined
          ? {
              timezone: normalizeText(update.timezone),
            }
          : {}),

        ...(update.locale !== undefined
          ? {
              locale: normalizeText(update.locale),
            }
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
          ? {
              model: normalizeText(update.model),
            }
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
          ? {
              allowedEmailDomains: normalizeDomains(update.allowedEmailDomains),
            }
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
