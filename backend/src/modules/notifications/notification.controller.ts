import type { Request, RequestHandler } from "express";

import { ApiError } from "../../utils/apiError.js";

import { NOTIFICATION_MESSAGES } from "./notification.constants.js";

import { notificationService } from "./notification.service.js";

import type {
  NotificationContext,
  NotificationTypeValue,
} from "./notification.types.js";

import { notificationValidator } from "./notification.validator.js";

function getContext(request: Request): NotificationContext {
  const userId = request.user?.userId;

  const workspaceId = request.workspaceId ?? request.user?.workspaceId;

  if (!userId) {
    throw new ApiError(401, NOTIFICATION_MESSAGES.UNAUTHORIZED);
  }

  if (!workspaceId) {
    throw new ApiError(400, NOTIFICATION_MESSAGES.WORKSPACE_REQUIRED);
  }

  return {
    userId,
    workspaceId,
  };
}

function getNotificationId(request: Request): string {
  const parsed = notificationValidator.notificationParams.safeParse(
    request.params,
  );

  if (!parsed.success) {
    throw new ApiError(400, NOTIFICATION_MESSAGES.INVALID_ID);
  }

  return parsed.data.notificationId;
}

const list: RequestHandler = async (request, response) => {
  const parsed = notificationValidator.listQuery.safeParse(request.query);

  if (!parsed.success) {
    throw new ApiError(400, NOTIFICATION_MESSAGES.INVALID_QUERY);
  }

  const context = getContext(request);

  const data = await notificationService.list(context, {
    page: parsed.data.page,

    limit: parsed.data.limit,

    isRead: parsed.data.isRead,

    type: parsed.data.type as NotificationTypeValue | undefined,
  });

  response.status(200).json({
    success: true,
    data,
  });
};

const getUnreadCount: RequestHandler = async (request, response) => {
  const context = getContext(request);

  const data = await notificationService.getUnreadCount(context);

  response.status(200).json({
    success: true,
    data,
  });
};

const getById: RequestHandler = async (request, response) => {
  const context = getContext(request);

  const notificationId = getNotificationId(request);

  const data = await notificationService.getById(context, notificationId);

  response.status(200).json({
    success: true,
    data,
  });
};

const markAsRead: RequestHandler = async (request, response) => {
  const context = getContext(request);

  const notificationId = getNotificationId(request);

  const data = await notificationService.markAsRead(context, notificationId);

  response.status(200).json({
    success: true,
    data,
  });
};

const markAsUnread: RequestHandler = async (request, response) => {
  const context = getContext(request);

  const notificationId = getNotificationId(request);

  const data = await notificationService.markAsUnread(context, notificationId);

  response.status(200).json({
    success: true,
    data,
  });
};

const markAllAsRead: RequestHandler = async (request, response) => {
  const context = getContext(request);

  const data = await notificationService.markAllAsRead(context);

  response.status(200).json({
    success: true,
    data,
  });
};

const remove: RequestHandler = async (request, response) => {
  const context = getContext(request);

  const notificationId = getNotificationId(request);

  await notificationService.remove(context, notificationId);

  response.status(200).json({
    success: true,

    message: "Notification deleted successfully.",
  });
};

const removeRead: RequestHandler = async (request, response) => {
  const context = getContext(request);

  const data = await notificationService.removeRead(context);

  response.status(200).json({
    success: true,
    data,
  });
};

const clear: RequestHandler = async (request, response) => {
  const context = getContext(request);

  const data = await notificationService.clear(context);

  response.status(200).json({
    success: true,
    data,
  });
};

export const notificationController = {
  list,
  getUnreadCount,
  getById,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  remove,
  removeRead,
  clear,
};
