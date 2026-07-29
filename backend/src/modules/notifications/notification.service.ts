import { logger } from "../../config/logger.js";

import { ApiError } from "../../utils/apiError.js";

import { NOTIFICATION_MESSAGES } from "./notification.constants.js";

import { notificationMapper } from "./notification.mapper.js";

import { notificationRepository } from "./notification.repository.js";

import type {
  NotificationContext,
  NotificationListQuery,
  NotificationListResponse,
  NotificationResponse,
  PublishNotificationInput,
} from "./notification.types.js";

async function list(
  context: NotificationContext,
  query: NotificationListQuery,
): Promise<NotificationListResponse> {
  const result = await notificationRepository.list(
    context.workspaceId,
    context.userId,
    query,
  );

  return {
    notifications: notificationMapper.toResponseList(result.notifications),

    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },

    unreadCount: result.unreadCount,
  };
}

async function getUnreadCount(context: NotificationContext): Promise<{
  unreadCount: number;
}> {
  const unreadCount = await notificationRepository.countUnread(
    context.workspaceId,
    context.userId,
  );

  return {
    unreadCount,
  };
}

async function getById(
  context: NotificationContext,
  notificationId: string,
): Promise<NotificationResponse> {
  const notification = await notificationRepository.findById(
    notificationId,
    context.workspaceId,
    context.userId,
  );

  if (!notification) {
    throw new ApiError(404, NOTIFICATION_MESSAGES.NOT_FOUND);
  }

  return notificationMapper.toResponse(notification);
}

async function markAsRead(
  context: NotificationContext,
  notificationId: string,
): Promise<NotificationResponse> {
  const notification = await notificationRepository.markAsRead(
    notificationId,
    context.workspaceId,
    context.userId,
  );

  if (!notification) {
    throw new ApiError(404, NOTIFICATION_MESSAGES.NOT_FOUND);
  }

  return notificationMapper.toResponse(notification);
}

async function markAsUnread(
  context: NotificationContext,
  notificationId: string,
): Promise<NotificationResponse> {
  const notification = await notificationRepository.markAsUnread(
    notificationId,
    context.workspaceId,
    context.userId,
  );

  if (!notification) {
    throw new ApiError(404, NOTIFICATION_MESSAGES.NOT_FOUND);
  }

  return notificationMapper.toResponse(notification);
}

async function markAllAsRead(context: NotificationContext): Promise<{
  updatedCount: number;
}> {
  const result = await notificationRepository.markAllAsRead(
    context.workspaceId,
    context.userId,
  );

  return {
    updatedCount: result.count,
  };
}

async function remove(
  context: NotificationContext,
  notificationId: string,
): Promise<void> {
  const result = await notificationRepository.deleteById(
    notificationId,
    context.workspaceId,
    context.userId,
  );

  if (result.count === 0) {
    throw new ApiError(404, NOTIFICATION_MESSAGES.NOT_FOUND);
  }
}

async function removeRead(context: NotificationContext): Promise<{
  deletedCount: number;
}> {
  const result = await notificationRepository.deleteRead(
    context.workspaceId,
    context.userId,
  );

  return {
    deletedCount: result.count,
  };
}

async function clear(context: NotificationContext): Promise<{
  deletedCount: number;
}> {
  const result = await notificationRepository.clear(
    context.workspaceId,
    context.userId,
  );

  return {
    deletedCount: result.count,
  };
}

async function publish(input: PublishNotificationInput): Promise<NotificationResponse> {
  const notification = await notificationRepository.create(input);
  return notificationMapper.toResponse(notification);
}

async function publishMany(inputs: PublishNotificationInput[]): Promise<{ count: number }> {
  if (inputs.length === 0) {
    return { count: 0 };
  }

  return notificationRepository.createMany(inputs);
}

async function publishSafe(input: PublishNotificationInput): Promise<void> {
  try {
    await publish(input);
  } catch (error) {
    logger.error({
      module: "notifications",
      message: "Unable to publish notification",
      notificationType: input.type,
      userId: input.userId,
      workspaceId: input.workspaceId,
      error: error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error,
    });
  }
}

async function publishManySafe(inputs: PublishNotificationInput[]): Promise<void> {
  if (inputs.length === 0) {
    return;
  }

  try {
    await publishMany(inputs);
  } catch (error) {
    logger.error({
      module: "notifications",
      message: "Unable to publish multiple notifications",
      notificationCount: inputs.length,
      workspaceId: inputs[0]?.workspaceId,
      error: error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error,
    });
  }
}

export const notificationPublisher = {
  publish,
  publishMany,
  publishSafe,
  publishManySafe,
};

export const notificationService = {
  list,
  getUnreadCount,
  getById,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  remove,
  removeRead,
  clear,
  publish,
  publishMany,
  publishSafe,
  publishManySafe,
};
