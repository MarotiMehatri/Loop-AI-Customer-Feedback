import type { Request, Response } from "express";

import { ApiError } from "../../utils/apiError.js";

import { NOTIFICATION_MESSAGES } from "./notification.constants.js";

import { notificationService } from "./notification.service.js";

import {
  listQuerySchema,
  notificationParamsSchema,
} from "./notification.validator.js";

import type { NotificationTypeValue } from "./notification.types.js";

function getContext(request: Request) {
  const userId = request.user?.userId;
  const workspaceId = request.workspaceId ?? request.user?.workspaceId;

  if (!userId) {
    throw new ApiError(401, NOTIFICATION_MESSAGES.UNAUTHORIZED);
  }

  if (!workspaceId) {
    throw new ApiError(400, NOTIFICATION_MESSAGES.WORKSPACE_REQUIRED);
  }

  return { userId, workspaceId };
}

function getNotificationId(request: Request): string {
  const parsed = notificationParamsSchema.safeParse(request.params);

  if (!parsed.success) {
    throw new ApiError(400, NOTIFICATION_MESSAGES.INVALID_ID);
  }

  return parsed.data.notificationId;
}

export const listController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const parsed = listQuerySchema.safeParse(request.query);

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

export const getUnreadCountController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getContext(request);

  const data = await notificationService.getUnreadCount(context);

  response.status(200).json({
    success: true,
    data,
  });
};

export const getByIdController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getContext(request);

  const notificationId = getNotificationId(request);

  const data = await notificationService.getById(context, notificationId);

  response.status(200).json({
    success: true,
    data,
  });
};

export const markAsReadController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getContext(request);

  const notificationId = getNotificationId(request);

  const data = await notificationService.markAsRead(context, notificationId);

  response.status(200).json({
    success: true,
    data,
  });
};

export const markAsUnreadController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getContext(request);

  const notificationId = getNotificationId(request);

  const data = await notificationService.markAsUnread(context, notificationId);

  response.status(200).json({
    success: true,
    data,
  });
};

export const markAllAsReadController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getContext(request);

  const data = await notificationService.markAllAsRead(context);

  response.status(200).json({
    success: true,
    data,
  });
};

export const removeController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getContext(request);

  const notificationId = getNotificationId(request);

  await notificationService.remove(context, notificationId);

  response.status(200).json({
    success: true,
    message: "Notification deleted successfully.",
  });
};

export const removeReadController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getContext(request);

  const data = await notificationService.removeRead(context);

  response.status(200).json({
    success: true,
    data,
  });
};

export const clearController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const context = getContext(request);

  const data = await notificationService.clear(context);

  response.status(200).json({
    success: true,
    data,
  });
};
