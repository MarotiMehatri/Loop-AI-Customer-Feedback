export const PERMISSION = {
  // Dashboard
  DASHBOARD_READ: "dashboard:read",

  // Activity
  ACTIVITY_READ: "activity:read",

  ACTIVITY_DELETE: "activity:delete",

  ACTIVITY_CLEAR: "activity:clear",

  // Analytics
  ANALYTICS_READ: "analytics:read",

  // Ask LOOP AI
  ASK_LOOP_USE: "ask-loop:use",

  // Feedback
  FEEDBACK_READ: "feedback:read",

  FEEDBACK_CREATE: "feedback:create",

  FEEDBACK_UPDATE: "feedback:update",

  FEEDBACK_DELETE: "feedback:delete",

  FEEDBACK_IMPORT: "feedback:import",

  FEEDBACK_INBOX_MANAGE: "feedback-inbox:manage",

  // Members
  MEMBER_READ: "member:read",

  MEMBER_INVITE: "member:invite",

  MEMBER_UPDATE_ROLE: "member:update-role",

  MEMBER_REMOVE: "member:remove",

  // Notifications
  NOTIFICATION_READ_OWN: "notification:read-own",

  NOTIFICATION_UPDATE_OWN: "notification:update-own",

  NOTIFICATION_BROADCAST: "notification:broadcast",

  // Profile
  PROFILE_READ_OWN: "profile:read-own",

  PROFILE_UPDATE_OWN: "profile:update-own",

  // Reports
  REPORT_READ: "report:read",

  REPORT_CREATE: "report:create",

  REPORT_UPDATE: "report:update",

  REPORT_DELETE: "report:delete",

  // Settings
  SETTINGS_READ: "settings:read",

  SETTINGS_UPDATE: "settings:update",

  SETTINGS_RESET: "settings:reset",

  // Themes
  THEME_READ: "theme:read",

  THEME_CREATE: "theme:create",

  THEME_UPDATE: "theme:update",

  THEME_DELETE: "theme:delete",

  THEME_GENERATE: "theme:generate",

  // Workspace
  WORKSPACE_READ: "workspace:read",

  WORKSPACE_UPDATE: "workspace:update",

  WORKSPACE_ARCHIVE: "workspace:archive",

  WORKSPACE_RESTORE: "workspace:restore",

  WORKSPACE_DELETE: "workspace:delete",
} as const;

export type Permission = (typeof PERMISSION)[keyof typeof PERMISSION];
