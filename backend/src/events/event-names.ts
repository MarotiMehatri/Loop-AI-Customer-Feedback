export const FEEDBACK_CREATED = "feedback:created" as const;
export const FEEDBACK_UPDATED = "feedback:updated" as const;
export const FEEDBACK_DELETED = "feedback:deleted" as const;

export const THEME_CREATED = "theme:created" as const;
export const THEME_UPDATED = "theme:updated" as const;
export const THEME_DELETED = "theme:deleted" as const;

export const REPORT_GENERATED = "report:generated" as const;

export const MEMBER_INVITED = "member:invited" as const;
export const MEMBER_REMOVED = "member:removed" as const;

export const NOTIFICATION_CREATED = "notification:created" as const;

export const IMPORT_COMPLETED = "import:completed" as const;

export type EventName =
  | typeof FEEDBACK_CREATED
  | typeof FEEDBACK_UPDATED
  | typeof FEEDBACK_DELETED
  | typeof THEME_CREATED
  | typeof THEME_UPDATED
  | typeof THEME_DELETED
  | typeof REPORT_GENERATED
  | typeof MEMBER_INVITED
  | typeof MEMBER_REMOVED
  | typeof NOTIFICATION_CREATED
  | typeof IMPORT_COMPLETED;
