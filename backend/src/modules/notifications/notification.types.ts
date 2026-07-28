import type { Notification, Prisma } from "../../generated/prisma/client.js";

export type NotificationTypeValue = Notification["type"];

export type NotificationPriorityValue = Notification["priority"];

export interface NotificationContext {
  userId: string;
  workspaceId: string;
}

export interface NotificationListQuery {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationTypeValue;
}

export interface CreateNotificationInput {
  userId: string;
  workspaceId: string;
  type: NotificationTypeValue;
  title: string;
  message: string;

  metadata?: Prisma.InputJsonValue;

  entityType?: string | null;

  entityId?: string | null;

  priority?: NotificationPriorityValue;
}

export type PublishNotificationInput = CreateNotificationInput;

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotificationResponse {
  id: string;
  userId: string;
  workspaceId: string;
  type: NotificationTypeValue;
  title: string;
  message: string;
  metadata: Prisma.JsonValue;
  isRead: boolean;
  readAt: string | null;
  entityType: string | null;
  entityId: string | null;
  priority: NotificationPriorityValue;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];

  pagination: NotificationPagination;

  unreadCount: number;
}
