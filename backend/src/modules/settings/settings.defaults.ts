import type {
  AiSettings,
  FeedbackSettings,
  GeneralSettings,
  ReportSettings,
  RetentionSettings,
  SecuritySettings,
  SettingsDataMap,
  SettingsSection,
  SettingsSectionValue,
  WorkspaceNotificationSettings,
} from "./settings.types.js";

export const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  timezone: "Asia/Kolkata",
  locale: "en-IN",
  dateFormat: "DD/MM/YYYY",
  weekStartsOn: 1,
};

export const DEFAULT_AI_SETTINGS: AiSettings = {
  enabled: true,
  model: "claude-sonnet-4-6",

  autoClassification: true,
  sentimentAnalysis: true,
  autoThemeDetection: true,
  askLoopEnabled: true,

  confidenceThreshold: 0.7,
  maxThemesPerFeedback: 5,
};

export const DEFAULT_FEEDBACK_SETTINGS: FeedbackSettings = {
  defaultStatus: "NEW",

  allowManualEntry: true,
  allowCsvImport: true,

  autoClassifyNewFeedback: true,
  duplicateDetection: true,
  duplicateThreshold: 0.9,
};

export const DEFAULT_REPORT_SETTINGS: ReportSettings = {
  defaultPeriodDays: 7,

  includeQuotes: true,
  includeRecommendations: true,

  autoGenerateWeekly: false,
  weeklyGenerationDay: 1,

  defaultExportFormat: "PDF",
};

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  sessionTimeoutMinutes: 480,
  requireStrongPasswords: true,
  maxLoginAttempts: 5,

  restrictEmailDomains: false,
  allowedEmailDomains: [],
};

export const DEFAULT_RETENTION_SETTINGS: RetentionSettings = {
  feedbackRetentionDays: 365,
  reportRetentionDays: 365,
  activityRetentionDays: 90,
  notificationRetentionDays: 90,
};

export const DEFAULT_NOTIFICATION_SETTINGS: WorkspaceNotificationSettings = {
  reportCreated: true,
  reportCompleted: true,
  reportFailed: true,

  feedbackImported: true,
  feedbackAssigned: true,

  memberInvited: true,
  memberRoleChanged: true,

  securityAlerts: true,
  workspaceUpdates: true,
};

export const DEFAULT_WORKSPACE_SETTINGS: SettingsDataMap = {
  general: DEFAULT_GENERAL_SETTINGS,
  ai: DEFAULT_AI_SETTINGS,
  feedback: DEFAULT_FEEDBACK_SETTINGS,
  reports: DEFAULT_REPORT_SETTINGS,
  security: DEFAULT_SECURITY_SETTINGS,
  retention: DEFAULT_RETENTION_SETTINGS,

  notifications: DEFAULT_NOTIFICATION_SETTINGS,
};

export function getDefaultSettingsSection(
  section: SettingsSection,
): SettingsSectionValue {
  switch (section) {
    case "general":
      return {
        ...DEFAULT_GENERAL_SETTINGS,
      };

    case "ai":
      return {
        ...DEFAULT_AI_SETTINGS,
      };

    case "feedback":
      return {
        ...DEFAULT_FEEDBACK_SETTINGS,
      };

    case "reports":
      return {
        ...DEFAULT_REPORT_SETTINGS,
      };

    case "security":
      return {
        ...DEFAULT_SECURITY_SETTINGS,

        allowedEmailDomains: [...DEFAULT_SECURITY_SETTINGS.allowedEmailDomains],
      };

    case "retention":
      return {
        ...DEFAULT_RETENTION_SETTINGS,
      };

    case "notifications":
      return {
        ...DEFAULT_NOTIFICATION_SETTINGS,
      };
  }
}
