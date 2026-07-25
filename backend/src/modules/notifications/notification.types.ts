import type {
  NotificationPriority,
  NotificationType,
} from "../../generated/prisma/client.js";

export type NotificationSortField = "createdAt" | "priority" | "title";

export type NotificationSortOrder = "asc" | "desc";

export interface NotificationContext {
  userId: string;
  workspaceId: string;
}

export interface NotificationListQuery {
  page: number;
  limit: number;

  search?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;

  startDate?: Date;
  endDate?: Date;

  sortBy: NotificationSortField;
  sortOrder: NotificationSortOrder;
}

export interface NotificationClearQuery {
  onlyRead?: boolean;
  beforeDate?: Date;
}

export interface CreateNotificationInput {
  userId: string;
  workspaceId: string;

  type: NotificationType;
  priority?: NotificationPriority;

  title: string;
  message: string;

  entityType?: string;
  entityId?: string;

  metadata?: Record<string, unknown>;
}

export type PublishNotificationInput = CreateNotificationInput;

export interface NotificationResponse {
  id: string;

  type: NotificationType;
  priority: NotificationPriority;

  title: string;
  message: string;

  isRead: boolean;
  readAt: Date | null;

  entityType: string | null;
  entityId: string | null;

  metadata: unknown;

  userId: string;
  workspaceId: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotificationListResponse {
  items: NotificationResponse[];
  pagination: NotificationPagination;
}
