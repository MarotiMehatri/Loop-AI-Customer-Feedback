import type { Role } from "../../generated/prisma/client.js";

export const SETTINGS_SECTIONS = [
  "general",
  "ai",
  "feedback",
  "reports",
  "security",
  "retention",
  "notifications",
] as const;

export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];

export type SettingsDateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";

export type SettingsWeekStart = 0 | 1 | 6;

export type DefaultFeedbackStatus = "NEW" | "REVIEWED" | "ACTIONED";

export type DefaultReportExportFormat = "PDF" | "CSV" | "JSON";

export interface SettingsContext {
  userId: string;
  workspaceId: string;
  role: Role;
}

export interface GeneralSettings {
  timezone: string;
  locale: string;
  dateFormat: SettingsDateFormat;
  weekStartsOn: SettingsWeekStart;
}

export interface AiSettings {
  enabled: boolean;
  model: string;

  autoClassification: boolean;
  sentimentAnalysis: boolean;
  autoThemeDetection: boolean;
  askLoopEnabled: boolean;

  confidenceThreshold: number;
  maxThemesPerFeedback: number;
}

export interface FeedbackSettings {
  defaultStatus: DefaultFeedbackStatus;

  allowManualEntry: boolean;
  allowCsvImport: boolean;

  autoClassifyNewFeedback: boolean;
  duplicateDetection: boolean;
  duplicateThreshold: number;
}

export interface ReportSettings {
  defaultPeriodDays: number;

  includeQuotes: boolean;
  includeRecommendations: boolean;

  autoGenerateWeekly: boolean;
  weeklyGenerationDay: number;

  defaultExportFormat: DefaultReportExportFormat;
}

export interface SecuritySettings {
  sessionTimeoutMinutes: number;
  requireStrongPasswords: boolean;
  maxLoginAttempts: number;

  restrictEmailDomains: boolean;
  allowedEmailDomains: string[];
}

export interface RetentionSettings {
  feedbackRetentionDays: number;
  reportRetentionDays: number;
  activityRetentionDays: number;
  notificationRetentionDays: number;
}

export interface WorkspaceNotificationSettings {
  reportCreated: boolean;
  reportCompleted: boolean;
  reportFailed: boolean;

  feedbackImported: boolean;
  feedbackAssigned: boolean;

  memberInvited: boolean;
  memberRoleChanged: boolean;

  securityAlerts: boolean;
  workspaceUpdates: boolean;
}

export interface SettingsDataMap {
  general: GeneralSettings;
  ai: AiSettings;
  feedback: FeedbackSettings;
  reports: ReportSettings;
  security: SecuritySettings;
  retention: RetentionSettings;
  notifications: WorkspaceNotificationSettings;
}

export type SettingsSectionValue = SettingsDataMap[SettingsSection];

export type SettingsUpdateMap = {
  [Section in SettingsSection]: Partial<SettingsDataMap[Section]>;
};

export type SettingsSectionUpdate = SettingsUpdateMap[SettingsSection];

export interface SettingsResponse extends SettingsDataMap {
  id: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}
