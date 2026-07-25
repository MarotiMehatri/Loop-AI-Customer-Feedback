import { z } from "zod";

import {
  SETTINGS_MAX_EMAIL_DOMAINS,
  SETTINGS_MAX_LOCALE_LENGTH,
  SETTINGS_MAX_MODEL_LENGTH,
  SETTINGS_MAX_RETENTION_DAYS,
  SETTINGS_MAX_SESSION_TIMEOUT,
  SETTINGS_MAX_TIMEZONE_LENGTH,
  SETTINGS_MIN_RETENTION_DAYS,
  SETTINGS_MIN_SESSION_TIMEOUT,
} from "./settings.constants.js";

import { SETTINGS_SECTIONS } from "./settings.types.js";

function requireAtLeastOneField<Schema extends z.ZodRawShape>(
  schema: z.ZodObject<Schema>,
) {
  return schema.strict().refine((value) => Object.keys(value).length > 0, {
    message: "At least one settings field is required",
  });
}

export const settingsSectionSchema = z.object({
  params: z.object({
    section: z.enum(SETTINGS_SECTIONS),
  }),
});

export const updateGeneralSettingsBody = requireAtLeastOneField(
  z.object({
    timezone: z
      .string()
      .trim()
      .min(1)
      .max(SETTINGS_MAX_TIMEZONE_LENGTH)
      .optional(),

    locale: z.string().trim().min(2).max(SETTINGS_MAX_LOCALE_LENGTH).optional(),

    dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]).optional(),

    weekStartsOn: z
      .union([z.literal(0), z.literal(1), z.literal(6)])
      .optional(),
  }),
);

export const updateAiSettingsBody = requireAtLeastOneField(
  z.object({
    enabled: z.boolean().optional(),

    model: z.string().trim().min(1).max(SETTINGS_MAX_MODEL_LENGTH).optional(),

    autoClassification: z.boolean().optional(),

    sentimentAnalysis: z.boolean().optional(),

    autoThemeDetection: z.boolean().optional(),

    askLoopEnabled: z.boolean().optional(),

    confidenceThreshold: z.number().min(0).max(1).optional(),

    maxThemesPerFeedback: z.number().int().min(1).max(20).optional(),
  }),
);

export const updateFeedbackSettingsBody = requireAtLeastOneField(
  z.object({
    defaultStatus: z.enum(["NEW", "REVIEWED", "ACTIONED"]).optional(),

    allowManualEntry: z.boolean().optional(),

    allowCsvImport: z.boolean().optional(),

    autoClassifyNewFeedback: z.boolean().optional(),

    duplicateDetection: z.boolean().optional(),

    duplicateThreshold: z.number().min(0).max(1).optional(),
  }),
);

export const updateReportSettingsBody = requireAtLeastOneField(
  z.object({
    defaultPeriodDays: z.number().int().min(1).max(365).optional(),

    includeQuotes: z.boolean().optional(),

    includeRecommendations: z.boolean().optional(),

    autoGenerateWeekly: z.boolean().optional(),

    weeklyGenerationDay: z.number().int().min(0).max(6).optional(),

    defaultExportFormat: z.enum(["PDF", "CSV", "JSON"]).optional(),
  }),
);

const emailDomainSchema = z
  .string()
  .trim()
  .min(3)
  .max(253)
  .regex(
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i,
    "Invalid email domain",
  );

export const updateSecuritySettingsBody = requireAtLeastOneField(
  z.object({
    sessionTimeoutMinutes: z
      .number()
      .int()
      .min(SETTINGS_MIN_SESSION_TIMEOUT)
      .max(SETTINGS_MAX_SESSION_TIMEOUT)
      .optional(),

    requireStrongPasswords: z.boolean().optional(),

    maxLoginAttempts: z.number().int().min(1).max(20).optional(),

    restrictEmailDomains: z.boolean().optional(),

    allowedEmailDomains: z
      .array(emailDomainSchema)
      .max(SETTINGS_MAX_EMAIL_DOMAINS)
      .optional(),
  }),
);

const retentionDaysSchema = z
  .number()
  .int()
  .min(SETTINGS_MIN_RETENTION_DAYS)
  .max(SETTINGS_MAX_RETENTION_DAYS);

export const updateRetentionSettingsBody = requireAtLeastOneField(
  z.object({
    feedbackRetentionDays: retentionDaysSchema.optional(),

    reportRetentionDays: retentionDaysSchema.optional(),

    activityRetentionDays: retentionDaysSchema.optional(),

    notificationRetentionDays: retentionDaysSchema.optional(),
  }),
);

export const updateNotificationSettingsBody = requireAtLeastOneField(
  z.object({
    reportCreated: z.boolean().optional(),

    reportCompleted: z.boolean().optional(),

    reportFailed: z.boolean().optional(),

    feedbackImported: z.boolean().optional(),

    feedbackAssigned: z.boolean().optional(),

    memberInvited: z.boolean().optional(),

    memberRoleChanged: z.boolean().optional(),

    securityAlerts: z.boolean().optional(),

    workspaceUpdates: z.boolean().optional(),
  }),
);

export const updateSettingsSchema = z.union([
  z.object({
    params: z.object({
      section: z.literal("general"),
    }),

    body: updateGeneralSettingsBody,
  }),

  z.object({
    params: z.object({
      section: z.literal("ai"),
    }),

    body: updateAiSettingsBody,
  }),

  z.object({
    params: z.object({
      section: z.literal("feedback"),
    }),

    body: updateFeedbackSettingsBody,
  }),

  z.object({
    params: z.object({
      section: z.literal("reports"),
    }),

    body: updateReportSettingsBody,
  }),

  z.object({
    params: z.object({
      section: z.literal("security"),
    }),

    body: updateSecuritySettingsBody,
  }),

  z.object({
    params: z.object({
      section: z.literal("retention"),
    }),

    body: updateRetentionSettingsBody,
  }),

  z.object({
    params: z.object({
      section: z.literal("notifications"),
    }),

    body: updateNotificationSettingsBody,
  }),
]);

export const resetSettingsSectionSchema = settingsSectionSchema;
