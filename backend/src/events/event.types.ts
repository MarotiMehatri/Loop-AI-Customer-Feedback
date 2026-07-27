import type {
  FEEDBACK_CREATED,
  FEEDBACK_UPDATED,
  FEEDBACK_DELETED,
  THEME_CREATED,
  THEME_UPDATED,
  THEME_DELETED,
  REPORT_GENERATED,
  MEMBER_INVITED,
  MEMBER_REMOVED,
  NOTIFICATION_CREATED,
  IMPORT_COMPLETED,
} from "./event-names.js";

export interface FeedbackEventData {
  id: string;
  workspaceId: string;
}

export interface ThemeEventData {
  id: string;
  workspaceId: string;
}

export interface ReportEventData {
  id: string;
  workspaceId: string;
}

export interface MemberEventData {
  userId: string;
  workspaceId: string;
  email: string;
}

export interface NotificationEventData {
  id: string;
  userId: string;
  workspaceId: string;
}

export interface ImportEventData {
  importId: string;
  workspaceId: string;
  successfulRows: number;
  failedRows: number;
}

export interface EventMap {
  [FEEDBACK_CREATED]: FeedbackEventData;
  [FEEDBACK_UPDATED]: FeedbackEventData;
  [FEEDBACK_DELETED]: FeedbackEventData;
  [THEME_CREATED]: ThemeEventData;
  [THEME_UPDATED]: ThemeEventData;
  [THEME_DELETED]: ThemeEventData;
  [REPORT_GENERATED]: ReportEventData;
  [MEMBER_INVITED]: MemberEventData;
  [MEMBER_REMOVED]: MemberEventData;
  [NOTIFICATION_CREATED]: NotificationEventData;
  [IMPORT_COMPLETED]: ImportEventData;
}

export type EventHandler<T> = (data: T) => Promise<void>;
