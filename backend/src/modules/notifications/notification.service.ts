import {
  ApiError,
} from "../../utils/apiError.js";

import {
  NOTIFICATION_MESSAGES,
} from "./notification.constants.js";

import {
  mapNotification,
  mapNotifications,
} from "./notification.mapper.js";

import {
  notificationRepository,
} from "./notification.repository.js";

import type {
  NotificationClearQuery,
  NotificationContext,
  NotificationListQuery,
  NotificationListResponse,
} from "./notification.types.js";

export const notificationService = {
  async list(
    context: NotificationContext,
    query: NotificationListQuery,
  ): Promise<NotificationListResponse> {
    const result =
      await notificationRepository.list(
        context.userId,
        context.workspaceId,
        query,
      );

    return {
      items:
        mapNotifications(result.items),

      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,

        totalPages: Math.ceil(
          result.total / query.limit,
        ),
      },
    };
  },

  async getById(
    context: NotificationContext,
    notificationId: string,
  ) {
    const notification =
      await notificationRepository.findById(
        notificationId,
        context.userId,
        context.workspaceId,
      );

    if (!notification) {
      throw new ApiError(
        404,
        NOTIFICATION_MESSAGES.notFound,
      );
    }

    return mapNotification(
      notification,
    );
  },

  async getUnreadCount(
    context: NotificationContext,
  ) {
    const count =
      await notificationRepository.countUnread(
        context.userId,
        context.workspaceId,
      );

    return {
      count,
    };
  },

  async markAsRead(
    context: NotificationContext,
    notificationId: string,
  ) {
    const notification =
      await notificationRepository.markAsRead(
        notificationId,
        context.userId,
        context.workspaceId,
      );

    if (!notification) {
      throw new ApiError(
        404,
        NOTIFICATION_MESSAGES.notFound,
      );
    }

    return mapNotification(
      notification,
    );
  },

  async markAllAsRead(
    context: NotificationContext,
  ) {
    const result =
      await notificationRepository.markAllAsRead(
        context.userId,
        context.workspaceId,
      );

    return {
      updatedCount: result.count,
    };
  },

  async remove(
    context: NotificationContext,
    notificationId: string,
  ): Promise<void> {
    const result =
      await notificationRepository.deleteById(
        notificationId,
        context.userId,
        context.workspaceId,
      );

    if (result.count === 0) {
      throw new ApiError(
        404,
        NOTIFICATION_MESSAGES.notFound,
      );
    }
  },

  async clear(
    context: NotificationContext,
    query: NotificationClearQuery,
  ) {
    const result =
      await notificationRepository.clear(
        context.userId,
        context.workspaceId,
        query,
      );

    return {
      deletedCount: result.count,
    };
  },
};